/**
 * Módulo para métodos shift() y unshift()
 */

/**
 * Ejercicio 3: shift() - Caso 1: Atender al primer cliente en una cola
 */
export const atenderPrimerCliente = (cola) => {
    if (!Array.isArray(cola) || cola.length === 0) return "Cola vacía";
    return cola.shift();
};

/**
 * Ejercicio 3: shift() - Caso 2: Procesar la primera notificación recibida
 */
export const procesarNotificacion = (notificaciones) => {
    if (!Array.isArray(notificaciones) || notificaciones.length === 0) return null;
    return notificaciones.shift();
};

/**
 * Ejercicio 3: shift() - Caso 3: Eliminar el primer elemento de un array de coordenadas
 */
export const eliminarCoordenadaInicial = (coordenadas) => {
    if (!Array.isArray(coordenadas) || coordenadas.length === 0) return [];
    coordenadas.shift();
    return coordenadas;
};

/**
 * Ejercicio 4: unshift() - Caso 1: Agregar un mensaje urgente al inicio de la bandeja
 */
export const agregarMensajeUrgente = (mensajes, mensaje) => {
    if (!Array.isArray(mensajes)) return [];
    mensajes.unshift({ priority: 'high', text: mensaje });
    return mensajes;
};

/**
 * Ejercicio 4: unshift() - Caso 2: Insertar un nuevo usuario al principio de la lista
 */
export const registrarUsuarioNuevo = (usuarios, usuario) => {
    if (!Array.isArray(usuarios)) return [];
    usuarios.unshift(usuario);
    return usuarios;
};

/**
 * Ejercicio 4: unshift() - Caso 3: Agregar una nueva versión de software al historial
 */
export const agregarVersion = (versiones, version) => {
    if (!Array.isArray(versiones)) return [];
    versiones.unshift(version);
    return versiones;
};
