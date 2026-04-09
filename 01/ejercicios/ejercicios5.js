function suma(a, b) {
  return a + b;
}

function resta(a, b) {
  return a - b;
}

function multipliclica(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}

// Datos de las operaciones
const operaciones = [
    { Operación: "Suma", Valores: "5 + 3", Resultado: suma(5, 3) },
    { Operación: "Resta", Valores: "8 - 6", Resultado: resta(8, 6) },
    { Operación: "Multiplicación", Valores: "3 * 11", Resultado: multipliclica(3, 11) },
    { Operación: "División", Valores: "30 / 5", Resultado: divide(30, 5) }
];

// Mostrar los resultados en una tabla por consola (funciona en terminal y en el navegador)
console.log("Resultados de las operaciones:");
console.table(operaciones);
