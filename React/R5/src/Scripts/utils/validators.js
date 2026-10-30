/**
 * Validadores y reglas de React Hook Form.
 *
 * Las reglas se exportan como fábricas/objetos listos para pasarle a
 * `register('campo', emailField)`. Los mismos criterios se replican en el
 * backend con express-validator: la validación del cliente es UX, la del
 * servidor es la que garantiza la integridad.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PASSWORD_MIN_LENGTH = 8;

/** ¿Es un email con formato válido? */
export function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_REGEX.test(value.trim());
}

/**
 * Fuerza mínima de contraseña: al menos una letra y un número.
 * No se exige símbolo obligatorio para no frustrar al usuario en una demo.
 */
export function isStrongEnoughPassword(value) {
  return (
    typeof value === 'string' &&
    value.length >= PASSWORD_MIN_LENGTH &&
    /[A-Za-z]/.test(value) &&
    /\d/.test(value)
  );
}

/* ------------------------------------------------------------------ *
 * Reglas de React Hook Form
 * ------------------------------------------------------------------ */

export const nameField = {
  required: 'Ingresá tu nombre.',
  minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres.' },
  maxLength: { value: 80, message: 'El nombre no puede superar los 80 caracteres.' },
};

export const emailField = {
  required: 'Ingresá tu email.',
  pattern: { value: EMAIL_REGEX, message: 'Ingresá un email válido.' },
};

/** Email opcional (ej: completar el registro de un proveedor sin email). */
export const optionalEmailField = {
  validate: (value) =>
    !value || isValidEmail(value) || 'Ingresá un email válido.',
};

export const passwordField = {
  required: 'Ingresá tu contraseña.',
  minLength: {
    value: PASSWORD_MIN_LENGTH,
    message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
  },
  validate: (value) =>
    isStrongEnoughPassword(value) ||
    'La contraseña debe incluir al menos una letra y un número.',
};

export const loginPasswordField = {
  required: 'Ingresá tu contraseña.',
};

/** Contraseña opcional (ej: definir una contraseña desde el perfil). */
export const optionalPasswordField = {
  validate: (value) =>
    !value ||
    isStrongEnoughPassword(value) ||
    `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres, con una letra y un número.`,
};

/** Confirmación de contraseña: compara contra el valor actual del campo. */
export function confirmPasswordField(getValues) {
  return {
    required: 'Repetí tu contraseña.',
    validate: (value) =>
      value === getValues('password') || 'Las contraseñas no coinciden.',
  };
}

/** Avatar: URL http(s) opcional. */
export const avatarUrlField = {
  validate: (value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) || 'Usá una URL http(s).';
    } catch {
      return 'Ingresá una URL válida.';
    }
  },
};
