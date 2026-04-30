/**
 * Módulo para métodos de transformación: reduce(), sort() y reverse()
 */

/**
 * Ejercicio 12: reduce() - Caso 1: Calcular el total de un carrito de compras
 */
export const calcularTotalCarrito = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
};

/**
 * Ejercicio 12: reduce() - Caso 2: Agrupar objetos por una propiedad
 */
export const agruparPorCategoria = (productos) => {
    if (!Array.isArray(productos)) return {};
    return productos.reduce((grupos, producto) => {
        const cat = producto.categoria;
        if (!grupos[cat]) grupos[cat] = [];
        grupos[cat].push(producto);
        return grupos;
    }, {});
};

/**
 * Ejercicio 12: reduce() - Caso 3: Contar ocurrencias de palabras en un array
 */
export const contarFrecuencias = (palabras) => {
    if (!Array.isArray(palabras)) return {};
    return palabras.reduce((conteo, palabra) => {
        conteo[palabra] = (conteo[palabra] || 0) + 1;
        return conteo;
    }, {});
};

/**
 * Ejercicio 13: sort() - Caso 1: Ordenar números de menor a mayor
 */
export const ordenarNumerosAsc = (numeros) => {
    if (!Array.isArray(numeros)) return [];
    return [...numeros].sort((a, b) => a - b);
};

/**
 * Ejercicio 13: sort() - Caso 2: Ordenar objetos por nombre alfabéticamente
 */
export const ordenarPorNombre = (usuarios) => {
    if (!Array.isArray(usuarios)) return [];
    return [...usuarios].sort((a, b) => a.nombre.localeCompare(b.nombre));
};

/**
 * Ejercicio 13: sort() - Caso 3: Ordenar productos por precio descendente
 */
export const ordenarPorPrecioDesc = (productos) => {
    if (!Array.isArray(productos)) return [];
    return [...productos].sort((a, b) => b.precio - a.precio);
};

/**
 * Ejercicio 14: reverse() - Caso 1: Invertir el orden de los comentarios
 */
export const invertirComentarios = (comentarios) => {
    if (!Array.isArray(comentarios)) return [];
    return [...comentarios].reverse();
};

/**
 * Ejercicio 14: reverse() - Caso 2: Voltear una cadena (vía array)
 */
export const voltearCadena = (str) => {
    if (typeof str !== 'string') return "";
    return str.split("").reverse().join("");
};

/**
 * Ejercicio 14: reverse() - Caso 3: Invertir el orden de las versiones de un software
 */
export const invertirVersiones = (versiones) => {
    if (!Array.isArray(versiones)) return [];
    return [...versiones].reverse();
};
