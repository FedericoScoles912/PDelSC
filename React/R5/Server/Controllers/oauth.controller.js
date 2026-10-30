import passport from 'passport';

import { pool } from '../Config/db.js';
import { signToken } from '../Config/jwt.js';
import { env } from '../Config/env.js';
import { PROVIDERS, isEmailTrusted, isManualProvider } from '../Config/providers.js';
import { issueState, peekState, createPkcePair } from '../Config/oauthState.js';
import { issueTempCode, peekTempCode, consumeTempCode } from '../Config/tempCode.js';
import { buildFrontendUrl, normalizeSystem } from '../Config/frontendRedirect.js';
import xProvider from '../Strategies/xStrategy.js';
import discordProvider from '../Strategies/discordStrategy.js';

/**
 * Proveedores cuyo flujo se implementa a mano, sin Passport
 * (porque no existe un paquete mantenido para ellos).
 */
const MANUAL_STRATEGIES = {
  x: xProvider,
  discord: discordProvider,
};

/** Genera el par PKCE solo si el proveedor lo exige (S256). */
function createPkceFor(providerId) {
  return PROVIDERS[providerId]?.usePkce
    ? createPkcePair()
    : { codeVerifier: null, codeChallenge: null };
}

/* ------------------------------------------------------------------ *
 * Helpers de base de datos
 * ------------------------------------------------------------------ */

function toPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar_url: row.avatar_url ?? null,
  };
}

async function findUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, avatar_url FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] ?? null;
}

async function findUserByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, name, email, avatar_url FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] ?? null;
}

async function findSocialAccount(provider, providerUserId) {
  const [rows] = await pool.query(
    'SELECT id, user_id, provider, provider_user_id, provider_email FROM social_accounts WHERE provider = ? AND provider_user_id = ? LIMIT 1',
    [provider, providerUserId]
  );
  return rows[0] ?? null;
}

/** Crea el usuario y su cuenta social en una sola transacción. */
async function createUserWithSocial({ provider, normalized }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, avatar_url) VALUES (?, ?, NULL, ?)',
      [normalized.name || 'Usuario', normalized.email, normalized.avatarUrl]
    );

    await connection.query(
      'INSERT INTO social_accounts (user_id, provider, provider_user_id, provider_email) VALUES (?, ?, ?, ?)',
      [userResult.insertId, provider, normalized.providerUserId, normalized.email]
    );

    await connection.commit();

    return {
      id: userResult.insertId,
      name: normalized.name || 'Usuario',
      email: normalized.email,
      avatar_url: normalized.avatarUrl,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/** Vincula una cuenta social a un usuario ya existente. */
async function linkAccountToUser({ userId, provider, normalized }) {
  try {
    await pool.query(
      'INSERT INTO social_accounts (user_id, provider, provider_user_id, provider_email) VALUES (?, ?, ?, ?)',
      [userId, provider, normalized.providerUserId, normalized.email]
    );
    return { ok: true };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return {
        ok: false,
        message: 'Esa cuenta ya está vinculada a otro usuario.',
      };
    }
    throw error;
  }
}

async function listLinkedAccounts(userId) {
  const [rows] = await pool.query(
    'SELECT id, provider, provider_email, created_at FROM social_accounts WHERE user_id = ? ORDER BY created_at ASC',
    [userId]
  );
  return rows;
}

/* ------------------------------------------------------------------ *
 * Resolución del perfil social
 * ------------------------------------------------------------------ */

/**
 * Decide qué hacer con un perfil recién devuelto por el proveedor.
 * Devuelve uno de: login | linked | created | needs_email | email_conflict
 */
async function resolveSocialLogin({ provider, normalized }) {
  if (!normalized.providerUserId) {
    return { status: 'error', message: 'El proveedor no devolvió un identificador de usuario.' };
  }

  // 1) Ya existe la cuenta social -> iniciar sesión.
  const account = await findSocialAccount(provider, normalized.providerUserId);
  if (account) {
    const user = await findUserById(account.user_id);
    if (user) {
      return { status: 'login', user, token: signToken(user) };
    }
  }

  // 2) El proveedor no entregó email (ej: X, o GitHub/Facebook con email
  //    privado) -> el frontend debe pedirlo antes de terminar el registro.
  if (!normalized.email) {
    return {
      status: 'needs_email',
      pending: {
        provider,
        providerUserId: normalized.providerUserId,
        suggestedName: normalized.name ?? '',
        avatarUrl: normalized.avatarUrl ?? null,
      },
    };
  }

  const existingUser = await findUserByEmail(normalized.email);

  // 3) Existe un usuario con ese email.
  if (existingUser) {
    const trusted = isEmailTrusted(provider, normalized.emailVerified);

    if (trusted) {
      // El proveedor garantiza el email: se vincula automáticamente.
      const result = await linkAccountToUser({
        userId: existingUser.id,
        provider,
        normalized,
      });
      if (!result.ok) return { status: 'error', message: result.message };
      return { status: 'linked', user: existingUser, token: signToken(existingUser) };
    }

    // No se puede garantizar el email: NO se vincula ni se inicia sesión
    // (evita un secuestro de cuenta). Se le explica al usuario qué hacer.
    return {
      status: 'email_conflict',
      message:
        `Ya existe una cuenta con el email ${normalized.email}. ` +
        'Iniciá sesión con tu email y contraseña y luego vinculá la cuenta ' +
        `de ${provider} desde tu perfil.`,
    };
  }

  // 4) Usuario nuevo.
  const user = await createUserWithSocial({ provider, normalized });
  return { status: 'created', user, token: signToken(user) };
}

/* ------------------------------------------------------------------ *
 * Inicio del flujo
 * ------------------------------------------------------------------ */

/** Redirige al proveedor usando Passport (o la URL manual, en el caso de X). */
function redirectToProvider(req, res, next, { provider, state, system, path }) {
  return passport.authenticate(provider, {
    session: false,
    state,
    failureRedirect: buildFrontendUrl({ system, path, params: { error: 'auth_failed' } }),
  })(req, res, next);
}

/**
 * GET /api/auth/:provider
 * Inicia el flujo OAuth de login.
 */
export async function startOAuthFlow(req, res, next) {
  try {
    const { provider } = req;

    // Continuación del flujo de vinculación: el state ya fue emitido por
    // POST /api/auth/link/:provider (que necesita conocer el userId).
    if (req.query.link === '1') {
      const linkState = peekState(req.query.state);
      if (linkState?.mode === 'link' && linkState.provider === provider) {
        return redirectToProvider(req, res, next, {
          provider,
          state: req.query.state,
          system: linkState.system,
          path: '/profile',
        });
      }
    }

    const system = normalizeSystem(req.query.system);
    const { codeVerifier, codeChallenge } = createPkceFor(provider);

    if (isManualProvider(provider)) {
      const state = issueState({ provider, mode: 'login', system, codeVerifier });
      return res.redirect(
        MANUAL_STRATEGIES[provider].buildAuthorizationUrl({ state, codeChallenge })
      );
    }

    const state = issueState({ provider, mode: 'login', system, codeVerifier: null });
    return redirectToProvider(req, res, next, {
      provider,
      state,
      system,
      path: '/auth/callback',
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/auth/link/:provider  (protegido)
 * Devuelve la URL de autorización para vincular una cuenta al usuario actual.
 * Se responde JSON (no un 302) porque el frontend necesita navegar a la URL
 * resultante y un POST cross-origin no puede seguir un redirect.
 */
export async function startLinkFlow(req, res, next) {
  try {
    const { provider } = req;
    const userId = req.user.id;
    const system = normalizeSystem(req.body?.system || req.query.system);
    const { codeVerifier, codeChallenge } = createPkceFor(provider);

    if (isManualProvider(provider)) {
      const state = issueState({ provider, mode: 'link', userId, system, codeVerifier });
      return res.json({
        authUrl: MANUAL_STRATEGIES[provider].buildAuthorizationUrl({ state, codeChallenge }),
        state,
      });
    }

    const state = issueState({ provider, mode: 'link', userId, system, codeVerifier: null });
    return res.json({
      authUrl: `${env.backendUrl}/api/auth/${provider}?link=1&state=${state}`,
      state,
    });
  } catch (error) {
    return next(error);
  }
}

/* ------------------------------------------------------------------ *
 * Callback
 * ------------------------------------------------------------------ */

/** Cierra el flujo: vincula la cuenta o emite el código temporal. */
async function finishOAuthCallback(req, res, next, stateRecord, payload) {
  try {
    const { provider, normalized } = payload;
    const { mode, userId, system } = stateRecord;

    if (mode === 'link') {
      const result = await linkAccountToUser({ userId, provider, normalized });
      if (!result.ok) {
        const code = issueTempCode({ type: 'error', message: result.message });
        return res.redirect(
          buildFrontendUrl({ system, path: '/profile', params: { code } })
        );
      }
      return res.redirect(
        buildFrontendUrl({ system, path: '/profile', params: { linked: provider } })
      );
    }

    const result = await resolveSocialLogin({ provider, normalized });
    const callbackPath = '/auth/callback';

    if (result.status === 'error' || result.status === 'email_conflict') {
      const code = issueTempCode({ type: 'error', message: result.message });
      return res.redirect(buildFrontendUrl({ system, path: callbackPath, params: { code } }));
    }

    if (result.status === 'needs_email') {
      const code = issueTempCode({ type: 'pending_email', pending: result.pending });
      return res.redirect(buildFrontendUrl({ system, path: callbackPath, params: { code } }));
    }

    const code = issueTempCode({
      type: 'session',
      status: result.status,
      token: result.token,
      user: result.user,
    });
    return res.redirect(buildFrontendUrl({ system, path: callbackPath, params: { code } }));
  } catch (error) {
    return next(error);
  }
}

/** Callback de los proveedores manuales (X, Discord): no pasan por Passport. */
async function handleManualCallback(req, res, next, stateRecord, provider) {
  const failurePath = stateRecord.mode === 'link' ? '/profile' : '/auth/callback';
  const { code, error } = req.query;

  try {
    if (error || !code) {
      const errorCode = error === 'access_denied' ? 'access_denied' : 'auth_failed';
      return res.redirect(
        buildFrontendUrl({ system: stateRecord.system, path: failurePath, params: { error: errorCode } })
      );
    }

    const strategy = MANUAL_STRATEGIES[provider];
    const tokenData = await strategy.exchangeCodeForToken({
      code,
      codeVerifier: stateRecord.codeVerifier,
    });
    const profile = await strategy.fetchUserProfile(tokenData.access_token);

    return finishOAuthCallback(req, res, next, stateRecord, {
      provider,
      normalized: strategy.normalize(profile),
    });
  } catch (callbackError) {
    return next(callbackError);
  }
}

/**
 * GET /api/auth/:provider/callback
 * Recibe el retorno del proveedor. El `state` ya fue validado y consumido
 * por el middleware validateOAuthState.
 */
export function oauthCallback(req, res, next) {
  const stateRecord = req.oauthState;
  const { provider } = req;

  if (isManualProvider(provider)) {
    return handleManualCallback(req, res, next, stateRecord, provider);
  }

  return passport.authenticate(provider, { session: false }, (err, payload) => {
    if (err) return next(err);

    const path = stateRecord.mode === 'link' ? '/profile' : '/auth/callback';

    if (!payload) {
      return res.redirect(
        buildFrontendUrl({ system: stateRecord.system, path, params: { error: 'auth_failed' } })
      );
    }

    return finishOAuthCallback(req, res, next, stateRecord, payload);
  })(req, res, next);
}

/* ------------------------------------------------------------------ *
 * Canje del código temporal
 * ------------------------------------------------------------------ */

/**
 * POST /api/auth/exchange
 * Canjea el código temporal por el JWT.
 * Si el código corresponde a un registro al que le falta el email, se
 * devuelve 400 con requiresEmail=true y el frontend pide completarlo;
 * el código NO se consume hasta que el registro se finaliza.
 */
export async function exchangeTempCode(req, res, next) {
  try {
    const { code, email } = req.body;

    const peeked = peekTempCode(code);
    if (!peeked) {
      return res.status(400).json({
        message: 'El código es inválido, ya fue usado o expiró. Volvé a intentar.',
      });
    }

    const { payload } = peeked;

    if (payload.type === 'error') {
      consumeTempCode(code);
      return res.status(409).json({ message: payload.message });
    }

    if (payload.type === 'session') {
      consumeTempCode(code);
      return res.json({
        token: payload.token,
        user: payload.user,
        status: payload.status,
      });
    }

    // type === 'pending_email'
    if (!email) {
      return res.status(400).json({
        message: 'Necesitamos un email para terminar de crear tu cuenta.',
        requiresEmail: true,
        profile: payload.pending,
      });
    }

    const { pending } = payload;
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      consumeTempCode(code);
      return res.status(409).json({
        message:
          `Ya existe una cuenta con el email ${email}. ` +
          'Iniciá sesión con tu email y contraseña y luego vinculá la cuenta ' +
          `de ${pending.provider} desde tu perfil.`,
      });
    }

    consumeTempCode(code);

    const normalized = {
      providerUserId: pending.providerUserId,
      email,
      emailVerified: true, // lo escribió el propio usuario en el formulario
      name: pending.suggestedName,
      avatarUrl: pending.avatarUrl,
    };

    const user = await createUserWithSocial({ provider: pending.provider, normalized });
    const token = signToken(user);

    return res.json({ token, user: toPublicUser(user), status: 'created' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe una cuenta con ese email.' });
    }
    return next(error);
  }
}

/* ------------------------------------------------------------------ *
 * Cuentas vinculadas
 * ------------------------------------------------------------------ */

/**
 * GET /api/auth/linked-accounts  (protegido)
 */
export async function getLinkedAccounts(req, res, next) {
  try {
    const userId = req.user.id;

    const [userRows] = await pool.query('SELECT password FROM users WHERE id = ? LIMIT 1', [userId]);
    const accounts = await listLinkedAccounts(userId);

    return res.json({
      accounts,
      // El frontend usa este flag para impedir desvincular la última
      // forma de acceso de un usuario sin contraseña.
      hasPassword: Boolean(userRows[0]?.password),
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/auth/link/:provider  (protegido)
 * Desvincula una cuenta social. No permite dejar al usuario sin ninguna
 * forma de acceso.
 */
export async function unlinkProvider(req, res, next) {
  try {
    const { provider } = req;
    const userId = req.user.id;

    const [userRows] = await pool.query('SELECT password FROM users WHERE id = ? LIMIT 1', [userId]);
    const accounts = await listLinkedAccounts(userId);

    const isLinked = accounts.some((account) => account.provider === provider);
    if (!isLinked) {
      return res.status(404).json({ message: 'No tenés una cuenta vinculada con ese proveedor.' });
    }

    const hasPassword = Boolean(userRows[0]?.password);
    if (!hasPassword && accounts.length === 1) {
      return res.status(409).json({
        message:
          'No podés desvincular tu única forma de acceso. ' +
          'Definí una contraseña desde tu perfil antes de desvincular esta cuenta.',
      });
    }

    await pool.query('DELETE FROM social_accounts WHERE user_id = ? AND provider = ?', [userId, provider]);

    return res.json({
      message: `Cuenta de ${provider} desvinculada.`,
      accounts: await listLinkedAccounts(userId),
      hasPassword,
    });
  } catch (error) {
    return next(error);
  }
}
