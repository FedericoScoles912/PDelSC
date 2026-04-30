/**
 * Módulo para métodos de búsqueda: indexOf() e includes()
 */

/**
 * Ejercicio 7: indexOf() - Caso 1: Buscar la posición de un ID de producto
 */
export const buscarIndiceProducto = (productos, id) => {
    if (!Array.isArray(productos)) return -1;
    return productos.indexOf(id);
};

/**
 * Ejercicio 7: indexOf() - Caso 2: Verificar si un email ya existe en la lista
 */
export const encontrarPosicionEmail = (emails, email) => {
    if (!Array.isArray(emails)) return -1;
    return emails.indexOf(email);
};

/**
 * Ejercicio 7: indexOf() - Caso 3: Encontrar la primera ocurrencia de un error
 */
export const buscarPrimerError = (logs, error) => {
    if (!Array.isArray(logs)) return -1;
    return logs.indexOf(error);
};

/**
 * Ejercicio 8: includes() - Caso 1: Verificar si un usuario tiene un rol específico
 */
export const tieneRol = (roles, rol) => {
    if (!Array.isArray(roles)) return false;
    return roles.includes(rol);
};

/**
 * Ejercicio 8: includes() - Caso 2: Comprobar si un ingrediente está en la receta
 */
export const contieneIngrediente = (receta, ingrediente) => {
    if (!Array.isArray(receta)) return false;
    return receta.includes(ingrediente);
};

/**
 * Ejercicio 8: includes() - Caso 3: Validar si un código de descuento es válido
 */
export const esCuponValido = (cupones, cupon) => {
    if (!Array.isArray(cupones)) return false;
    return cupones.includes(cupon);
};
