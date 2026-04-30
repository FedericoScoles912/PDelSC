/**
 * Módulo para métodos push() y pop()
 */

/**
 * Ejercicio 1: push() - Caso 1: Agregar un nuevo producto al carrito
 */
export const agregarProducto = (carrito, producto) => {
    if (!Array.isArray(carrito)) return [];
    if (!producto) return carrito;
    carrito.push(producto);
    return carrito;
};

/**
 * Ejercicio 1: push() - Caso 2: Registrar un nuevo log de sistema
 */
export const registrarLog = (logs, mensaje) => {
    if (!Array.isArray(logs)) return [];
    const nuevoLog = { fecha: new Date().toISOString(), mensaje };
    logs.push(nuevoLog);
    return logs;
};

/**
 * Ejercicio 1: push() - Caso 3: Agregar múltiples tareas a una lista
 */
export const agregarTareas = (lista, ...tareas) => {
    if (!Array.isArray(lista)) return [];
    lista.push(...tareas);
    return lista;
};

/**
 * Ejercicio 2: pop() - Caso 1: Eliminar el último elemento de una pila (Undo)
 */
export const deshacerAccion = (historial) => {
    if (!Array.isArray(historial) || historial.length === 0) return null;
    return historial.pop();
};

/**
 * Ejercicio 2: pop() - Caso 2: Atender al último cliente de una fila invertida
 */
export const atenderUltimoCliente = (fila) => {
    if (!Array.isArray(fila) || fila.length === 0) return "No hay clientes";
    return fila.pop();
};

/**
 * Ejercicio 2: pop() - Caso 3: Limpiar el último registro de un sensor
 */
export const eliminarUltimoRegistro = (registros) => {
    if (!Array.isArray(registros) || registros.length === 0) return [];
    registros.pop();
    return registros;
};
