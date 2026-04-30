/**
 * Módulo para métodos de iteración: forEach(), map() y filter()
 */

/**
 * Ejercicio 9: forEach() - Caso 1: Imprimir etiquetas de envío
 */
export const imprimirEtiquetas = (pedidos) => {
    if (!Array.isArray(pedidos)) return;
    pedidos.forEach(pedido => {
        console.log(`Etiqueta para: ${pedido.nombre} - Dirección: ${pedido.direccion}`);
    });
};

/**
 * Ejercicio 9: forEach() - Caso 2: Sumar puntos de fidelidad
 */
export const calcularPuntosTotales = (compras) => {
    if (!Array.isArray(compras)) return 0;
    let total = 0;
    compras.forEach(compra => total += compra.puntos);
    return total;
};

/**
 * Ejercicio 9: forEach() - Caso 3: Notificar a cada usuario
 */
export const enviarNotificaciones = (usuarios) => {
    if (!Array.isArray(usuarios)) return;
    usuarios.forEach(user => {
        console.log(`Enviando correo a ${user.email}...`);
    });
};

/**
 * Ejercicio 10: map() - Caso 1: Aplicar IVA a una lista de precios
 */
export const aplicarIVA = (precios) => {
    if (!Array.isArray(precios)) return [];
    const IVA = 1.21;
    return precios.map(precio => Number((precio * IVA).toFixed(2)));
};

/**
 * Ejercicio 10: map() - Caso 2: Formatear nombres de usuarios (Capitalize)
 */
export const formatearNombres = (nombres) => {
    if (!Array.isArray(nombres)) return [];
    return nombres.map(nombre => nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase());
};

/**
 * Ejercicio 10: map() - Caso 3: Extraer solo los IDs de un objeto
 */
export const extraerIds = (objetos) => {
    if (!Array.isArray(objetos)) return [];
    return objetos.map(obj => obj.id);
};

/**
 * Ejercicio 11: filter() - Caso 1: Obtener usuarios activos
 */
export const obtenerUsuariosActivos = (usuarios) => {
    if (!Array.isArray(usuarios)) return [];
    return usuarios.filter(user => user.activo === true);
};

/**
 * Ejercicio 11: filter() - Caso 2: Filtrar productos por rango de precio
 */
export const filtrarPorPrecio = (productos, min, max) => {
    if (!Array.isArray(productos)) return [];
    return productos.filter(p => p.precio >= min && p.precio <= max);
};

/**
 * Ejercicio 11: filter() - Caso 3: Eliminar elementos duplicados (usando filter e indexOf)
 */
export const eliminarDuplicados = (array) => {
    if (!Array.isArray(array)) return [];
    return array.filter((item, index) => array.indexOf(item) === index);
};
