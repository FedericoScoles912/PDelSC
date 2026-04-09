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

// Datos de las operaciones para la tabla
const operaciones = [
    { nombre: "Suma", valores: "5 + 3", resultado: suma(5, 3) },
    { nombre: "Resta", valores: "8 - 6", resultado: resta(8, 6) },
    { nombre: "Multiplicación", valores: "3 * 11", resultado: multipliclica(3, 11) },
    { nombre: "División", valores: "30 / 5", resultado: divide(30, 5) }
];

// Función para poblar la tabla en el HTML
const poblarTabla = () => {
    const tbody = document.querySelector("#tablaResultados tbody");
    if (tbody) {
        operaciones.forEach(op => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${op.nombre}</td>
                <td>${op.valores}</td>
                <td class="resultado">${op.resultado}</td>
            `;
            tbody.appendChild(fila);
        });
    }
};

// Ejecutar cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", poblarTabla);
