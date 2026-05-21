/**
 * Validaciones y utilidades puras
 */

/**
 * Valida si un string es un número entero válido
 * @param {string} val 
 * @returns {boolean}
 */
export const isInteger = (val) => {
    if (val === "" || val === null || val === undefined) return false;
    const num = Number(val);
    return Number.isInteger(num);
};

/**
 * Genera un timestamp para el nombre del archivo
 * Formato: YYYYMMDD_HHmmss
 */
export const getTimestamp = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const h = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const s = pad(now.getSeconds());
    
    return `${y}${m}${d}_${h}${mm}${s}`;
};

/**
 * Obtiene el primer y último dígito de un número (ignorando signo)
 * @param {number} num 
 * @returns {{first: number, last: number}}
 */
export const getFirstAndLastDigits = (num) => {
    const s = Math.abs(num).toString();
    return {
        first: parseInt(s[0]),
        last: parseInt(s[s.length - 1])
    };
};

/**
 * Verifica si un número es un factorial (hasta 12!)
 * @param {number} num 
 * @returns {number|null} El valor de N si es N!, de lo contrario null
 */
export const getFactorialN = (num) => {
    if (num < 1) return null;
    let fact = 1;
    for (let i = 1; i <= 12; i++) {
        fact *= i;
        if (fact === num) return i;
        if (fact > num) break;
    }
    return null;
};
