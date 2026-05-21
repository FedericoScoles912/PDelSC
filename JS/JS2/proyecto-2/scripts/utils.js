/**
 * Utilidades para el Proyecto 2
 */

/**
 * Verifica si un número cumple el filtro: primer y último dígito iguales
 * (Excluye números de un solo dígito entre -9 y 9)
 * @param {number} num 
 * @returns {boolean}
 */
export const checkDígitosFiltro = (num) => {
    const valorAbsoluto = Math.abs(num);
    if (valorAbsoluto <= 9) return false;
    const s = valorAbsoluto.toString();
    return s[0] === s[s.length - 1];
};

/**
 * Verifica si un número es un factorial (hasta 12!)
 * @param {number} num 
 * @returns {number|null} El valor de N si es N!, de lo contrario null
 */
export const getFactorialN = (num) => {
    if (num < 1) return null;
    // Pre-calculados para eficiencia
    const factorials = {
        1: [1, 0], // 1! = 1, 0! = 1
        2: 2,
        6: 3,
        24: 4,
        120: 5,
        720: 6,
        5040: 7,
        40320: 8,
        362880: 9,
        3628800: 10,
        39916800: 11,
        479001600: 12
    };

    if (num === 1) return 1; // Simplificamos: 1 = 1! (también es 0!)
    return factorials[num] || null;
};

/**
 * Formatea una fecha
 */
export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString('es-AR');
};
