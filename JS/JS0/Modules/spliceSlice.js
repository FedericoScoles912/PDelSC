/**
 * Módulo para métodos splice() y slice()
 */

/**
 * Ejercicio 5: splice() - Caso 1: Reemplazar un elemento en una posición específica
 */
export const reemplazarElemento = (array, index, nuevoElemento) => {
    if (!Array.isArray(array)) return [];
    if (index < 0 || index >= array.length) return array;
    array.splice(index, 1, nuevoElemento);
    return array;
};

/**
 * Ejercicio 5: splice() - Caso 2: Eliminar 2 elementos a partir de un índice
 */
export const eliminarVarios = (array, index) => {
    if (!Array.isArray(array)) return [];
    array.splice(index, 2);
    return array;
};

/**
 * Ejercicio 5: splice() - Caso 3: Insertar elementos sin eliminar ninguno
 */
export const insertarEnMedio = (array, index, ...elementos) => {
    if (!Array.isArray(array)) return [];
    array.splice(index, 0, ...elementos);
    return array;
};

/**
 * Ejercicio 6: slice() - Caso 1: Obtener una sublista de elementos (paginación)
 */
export const obtenerPagina = (elementos, inicio, fin) => {
    if (!Array.isArray(elementos)) return [];
    return elementos.slice(inicio, fin);
};

/**
 * Ejercicio 6: slice() - Caso 2: Clonar un array de forma superficial
 */
export const clonarArray = (array) => {
    if (!Array.isArray(array)) return [];
    return array.slice();
};

/**
 * Ejercicio 6: slice() - Caso 3: Obtener los últimos N elementos de un array
 */
export const obtenerUltimos = (array, n) => {
    if (!Array.isArray(array)) return [];
    return array.slice(-n);
};
