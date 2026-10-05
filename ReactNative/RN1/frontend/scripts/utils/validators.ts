/**
 * Funciones de validación de campos para formularios
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida que un campo no esté vacío o compuesto sólo por espacios
 * @param value - Valor a comprobar
 * @param fieldName - Nombre legible del campo para el mensaje de error
 */
export function validateRequired(value: string, fieldName: string = 'Este campo'): ValidationResult {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} es obligatorio.`,
    };
  }
  return { isValid: true };
}

/**
 * Valida longitud mínima requerida
 * @param value - Valor a comprobar
 * @param minLength - Longitud mínima esperada
 * @param fieldName - Nombre legible del campo
 */
export function validateMinLength(value: string, minLength: number, fieldName: string = 'Este campo'): ValidationResult {
  if (value.trim().length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} debe tener al menos ${minLength} caracteres.`,
    };
  }
  return { isValid: true };
}
