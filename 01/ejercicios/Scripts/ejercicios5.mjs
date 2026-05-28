import { suma, resta, multipliclica, divide } from './calculos.js';

// Datos de las operaciones
const ejercicio5Operaciones = [
    { Operación: "Suma", Valores: "5 + 3", Resultado: suma(5, 3) },
    { Operación: "Resta", Valores: "8 - 6", Resultado: resta(8, 6) },
    { Operación: "Multiplicación", Valores: "3 * 11", Resultado: multipliclica(3, 11) },
    { Operación: "División", Valores: "30 / 5", Resultado: divide(30, 5) }
];

export { ejercicio5Operaciones };
