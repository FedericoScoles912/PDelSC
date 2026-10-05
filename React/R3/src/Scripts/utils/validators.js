export const nameValidationRules = {
  required: 'El nombre completo es obligatorio',
  minLength: {
    value: 2,
    message: 'El nombre debe tener al menos 2 caracteres',
  },
  maxLength: {
    value: 100,
    message: 'El nombre no puede superar los 100 caracteres',
  },
};

export const emailValidationRules = {
  required: 'El correo electrónico es obligatorio',
  pattern: {
    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: 'Ingresa un formato de correo electrónico válido',
  },
};

export const passwordValidationRules = {
  required: 'La contraseña es obligatoria',
  minLength: {
    value: 6,
    message: 'La contraseña debe tener al menos 6 caracteres',
  },
};

export const optionalPasswordValidationRules = {
  minLength: {
    value: 6,
    message: 'La nueva contraseña debe tener al menos 6 caracteres si decides cambiarla',
  },
};
