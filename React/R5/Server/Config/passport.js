import passport from 'passport';

import * as googleStrategy from '../Strategies/googleStrategy.js';
import * as facebookStrategy from '../Strategies/facebookStrategy.js';
import * as githubStrategy from '../Strategies/githubStrategy.js';
import * as twitchStrategy from '../Strategies/twitchStrategy.js';
import * as microsoftStrategy from '../Strategies/microsoftStrategy.js';
import * as linkedinStrategy from '../Strategies/linkedinStrategy.js';
import { isProviderEnabled } from './providers.js';

/**
 * Registro de estrategias Passport (una fábrica por proveedor).
 * X y Discord no usan Passport: se resuelven a mano en
 * /Server/Strategies (ver manualOAuth.js).
 */
const STRATEGY_FACTORIES = {
  google: googleStrategy.createStrategy,
  facebook: facebookStrategy.createStrategy,
  github: githubStrategy.createStrategy,
  twitch: twitchStrategy.createStrategy,
  microsoft: microsoftStrategy.createStrategy,
  linkedin: linkedinStrategy.createStrategy,
};

/**
 * Registra en Passport solo las estrategias con credenciales presentes.
 * Un proveedor sin CLIENT_ID/CLIENT_SECRET simplemente no se registra y
 * la API responde 501 si alguien intenta usarlo.
 */
export function configurePassport() {
  const registered = [];

  for (const [providerId, factory] of Object.entries(STRATEGY_FACTORIES)) {
    if (!isProviderEnabled(providerId)) continue;
    passport.use(providerId, factory());
    registered.push(providerId);
  }

  return { passport, registered };
}

export default passport;
