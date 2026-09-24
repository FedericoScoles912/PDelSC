# Configuración de proveedores OAuth 🔐

Este proyecto soporta **Google, Meta (Facebook), GitHub, X (Twitter), Discord y Twitch**.
Todos usan el flujo estándar **Authorization Code** con redirects.

> **Nota**: No hace falta configurar los 6. Podés dejar vacíos los `CLIENT_ID` de los que no usés y los botones quedarán visibles pero al hacer click el backend devolverá `501 · proveedor no configurado`.

---

## Índice

1. [Convenciones comunes](#convenciones-comunes)
2. [Google](#1-google)
3. [Meta / Facebook](#2-meta--facebook)
4. [GitHub](#3-github)
5. [X / Twitter](#4-x--twitter)
6. [Discord](#5-discord)
7. [Twitch](#6-twitch)

---

## Convenciones comunes

### URLs callback locales

Todos los callbacks del backend apuntan a:
```
http://localhost:5000/api/oauth/<PROVEEDOR>/callback
```

Reemplazá `<PROVEEDOR>` por: `google | meta | github | twitter | discord | twitch`.

> En **producción**: cambiá la URL de callback y la variable `{PROVEEDOR}_CALLBACK_URL` por el dominio real del backend.

### Orígenes autorizados (Frontend URL)

- Desarrollo: `http://localhost:5173`
- Si cambias el puerto frontend, actualizá también:
  - `FRONTEND_URL` en el `.env` del backend (CORS + redirect OAuth final)
  - La URL de callback final configurada en cada provider developer console.

### State + PKCE

- El backend genera un `state` único por request para **prevenir CSRF** (válido 10 min).
- **X (Twitter)** requiere además PKCE S256 (implementado en `twitterOAuth.js`).
- El resto no usa PKCE (no estándar para Authorization Code en esos providers).

---

## 1. Google

1. Entrá a <https://console.cloud.google.com/>
2. Creá un nuevo **Proyecto** y esperá que se aprovisione.
3. Menú → **APIs & Services** → **OAuth consent screen**:
   - Tipo de usuario: **External**
   - Nombre de la app, correo de soporte, dominio de app (vacío en dev).
   - Agregá tu correo como usuario de prueba (mientras no publiques la app).
4. Credentials → **Create Credentials** → **OAuth client ID**:
   - Application type: **Web application**
   - **Authorized JavaScript origins**: `http://localhost:5000` (o el dominio de prod)
   - **Authorized redirect URIs**:
     ```
     http://localhost:5000/api/oauth/google/callback
     ```
5. Tomá el **Client ID** y **Client Secret** y pegalos en `backend/.env`:

```env
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:5000/api/oauth/google/callback
```

Scopes usados: `openid email profile` (devuelve `sub`, `email`, `name`, `picture`).

---

## 2. Meta / Facebook

1. Entrá a <https://developers.facebook.com/>
2. **My Apps** → **Create App** → **Consumer** o **Business**
3. Nombre, correo, crear.
4. En el dashboard, **Use cases** → Customize "Facebook Login" → Web (`www`).
5. Site URL: `http://localhost:5000`
6. **Settings → Basic**:
   - App ID (tu client id)
   - App Secret (tu client secret — guardalo en .env)
   - App domains: `localhost`
   - Privacy policy URL: cualquiera (ej. `/privacy`)
7. **Products → Facebook Login → Settings**:
   - **Valid OAuth Redirect URIs**:
     ```
     http://localhost:5000/api/oauth/meta/callback
     ```
8. .env del backend:

```env
META_CLIENT_ID=1234567890
META_CLIENT_SECRET=abcxyz...
META_CALLBACK_URL=http://localhost:5000/api/oauth/meta/callback
```

Scopes usados: `email public_profile`. El endpoint `/me?fields=id,name,email,picture.type(large)` devuelve los datos.

> En `Development mode` solo podés loguearte como administrador/testers de la app. Para usuarios reales tenés que pasar **App Review**.

---

## 3. GitHub

1. <https://github.com/settings/developers> → **OAuth Apps** → **Register a new application**.
   - O para una organización: `<org> → Settings → Developer settings → OAuth Apps`.
2. Rellenar:
   - **Application name**
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**:
     ```
     http://localhost:5000/api/oauth/github/callback
     ```
3. Clickear **Register application**.
4. Copiar **Client ID**, y luego generar un **new client secret**.
5. .env:

```env
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxx
GITHUB_CALLBACK_URL=http://localhost:5000/api/oauth/github/callback
```

Scopes usados: `user:email read:user`. Si el usuario no tiene email público, se consulta `/user/emails` y se toma el `primary+verified`.

---

## 4. X / Twitter

1. Ir al **Developer Portal**: <https://developer.x.com/en/portal/dashboard>
2. Crear un **Project + App** (Free tier alcanza).
3. Una vez creada la app ir a **Settings → User authentication settings → Set up**.
4. Configurar:
   - **App permissions**: Read
   - **Type of App**: Web App
   - **App info**:
     - Callback URI / Redirect URL:
       ```
       http://localhost:5000/api/oauth/twitter/callback
       ```
     - Website URL: `http://localhost:5173`
     - Terms, Privacy (podés inventar una URL en localhost)
5. Volver a la pestaña **Keys and Tokens → OAuth 2.0 Client ID and Client Secret** y guardarlos.

```env
TWITTER_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
TWITTER_CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWITTER_CALLBACK_URL=http://localhost:5000/api/oauth/twitter/callback
```

Este provider usa **PKCE (S256)**. El `code_challenge` y `code_verifier` se generan en `twitterOAuth.js`.

> En plan **Free** solo se puede obtener el perfil (`users.read tweet.read offline.access`). El email no está disponible sin tier elevado. El campo `email` queda `NULL` en la DB para los usuarios que se loguean con X.

---

## 5. Discord

1. <https://discord.com/developers/applications> → **New Application**.
2. Nombre, confirmar.
3. Menú **OAuth2 → General**:
   - Client ID, Client Secret (Regenerar uno si no aparece).
   - Redirects → **Add Redirect**:
     ```
     http://localhost:5000/api/oauth/discord/callback
     ```
   - Guardar cambios.
4. .env:

```env
DISCORD_CLIENT_ID=123456789012345678
DISCORD_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DISCORD_CALLBACK_URL=http://localhost:5000/api/oauth/discord/callback
```

Scopes usados: `identify email`. El email solo se devuelve si el usuario lo **verificó**; si no, queda nulo.

---

## 6. Twitch

1. <https://dev.twitch.tv/console> → **Register Your Application**.
2. Nombre, **OAuth Redirect URLs**:
   ```
   http://localhost:5000/api/oauth/twitch/callback
   ```
   Category: "Website Integration".
3. Guardar. Volver a la lista → **Manage** → Generar **New Secret**.
4. .env:

```env
TWITCH_CLIENT_ID=xxxxxxxxxxxxxxxxx
TWITCH_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWITCH_CALLBACK_URL=http://localhost:5000/api/oauth/twitch/callback
```

Scope usado: `user:read:email`. El endpoint `/helix/users` requiere el `Client-Id` además del Bearer token (ya enviado por `twitchOAuth.js`).

---

## Listar proveedores configurados (runtime)

Sin tocar el código, el backend expone:

```
GET http://localhost:5000/api/oauth/providers
```

Ejemplo de respuesta:

```json
{
  "ok": true,
  "providers": [
    { "name": "google",  "configured": true  },
    { "name": "meta",    "configured": false },
    { "name": "github",  "configured": true  },
    { "name": "twitter", "configured": false },
    { "name": "discord", "configured": false },
    { "name": "twitch",  "configured": false }
  ]
}
```

Podés consumirlo desde el frontend para ocultar dinámicamente los proveedores no configurados (ejercicio opcional de extensión).

---

## Producción checklist rápido

- [ ] Todas las URLs `_CALLBACK_URL` apuntan al dominio real del backend (no localhost).
- [ ] `FRONTEND_URL` coincide exactamente con el dominio público del frontend (incluye https y puerto si no es 443).
- [ ] Cookies RT: `secure: true`, `NODE_ENV=production`.
- [ ] `ACCESS_TOKEN_SECRET` y `REFRESH_TOKEN_SECRET` son strings ≥ 64 bytes generados con `crypto.randomBytes(64).toString('hex')`.
- [ ] Google/Meta/etc. tienen los dominios autorizados correctos (localhost eliminado).
- [ ] El schema SQL fue ejecutado en la base de producción.

---

## Troubleshooting común

| Síntoma | Causa más probable |
|---|---|
| OAuth abre popup/redirect pero termina en `?oauth_error=google` | Credenciales mal cargadas, callback URL no coincide exactamente, o state expiró (> 10 min entre pasos). |
| `CORS missing allow credentials` | El origen de la petición no está en `FRONTEND_URL` del backend. |
| "No se pudo iniciar sesión" al loguear un email/pwd correctos | El usuario no fue creado con `register` tradicional (probablemente OAuth-only; `password_hash` es NULL). Ir a Perfil → Cambiar contraseña crea uno. |
| `refresh` devuelve 401 en dev | Cookie `refresh_token` no se envía por SameSite + navegador bloqueando cookies de localhost cross-site. Asegurarse de usar `http://localhost` tanto en frontend como backend (no 127.0.0.1 vs localhost mezclados). |
