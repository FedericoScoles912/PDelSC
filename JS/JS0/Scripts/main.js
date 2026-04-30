/**
 * Script Principal - JS Arrays Master
 * Gestiona la ejecución interactiva de módulos y el toggle de resultados.
 */

import * as PushPop from '../Modules/pushPop.js';
import * as ShiftUnshift from '../Modules/shiftUnshift.js';
import * as SpliceSlice from '../Modules/spliceSlice.js';
import * as SearchMethods from '../Modules/searchMethods.js';
import * as IterationMethods from '../Modules/iterationMethods.js';
import * as TransformMethods from '../Modules/transformMethods.js';

// Diccionario de funciones de ejecución por categoría
const executionMap = {
    pushPop: () => {
        const carrito = [];
        PushPop.agregarProducto(carrito, { id: 1, nombre: 'Laptop', precio: 1200 });
        const tareas = PushPop.agregarTareas([], "Lavar", "Cocinar");
        const historial = ["Home", "Products"];
        const ultimaAccion = PushPop.deshacerAccion(historial);
        return { carritoActualizado: carrito, tareasNuevas: tareas, accionDeshecha: ultimaAccion };
    },
    shiftUnshift: () => {
        const cola = ["Juan", "Ana"];
        const atendido = ShiftUnshift.atenderPrimerCliente(cola);
        const mensajes = [];
        ShiftUnshift.agregarMensajeUrgente(mensajes, "Servidor caído!");
        return { clienteAtendido: atendido, colaRestante: cola, mensajesBandeja: mensajes };
    },
    spliceSlice: () => {
        const frutas = ["Manzana", "Pera", "Naranja"];
        SpliceSlice.reemplazarElemento(frutas, 1, "Mango");
        const numeros = [1, 2, 3, 4, 5];
        const subLista = SpliceSlice.obtenerPagina(numeros, 1, 4);
        return { frutasModificadas: frutas, subListaPaginada: subLista };
    },
    searchMethods: () => {
        const ids = [101, 102, 103];
        const index = SearchMethods.buscarIndiceProducto(ids, 103);
        const roles = ["admin", "editor"];
        const esAdmin = SearchMethods.tieneRol(roles, "admin");
        return { indiceEncontrado: index, esAdministrador: esAdmin };
    },
    iterationMethods: () => {
        const preciosBase = [100, 200];
        const preciosConIVA = IterationMethods.aplicarIVA(preciosBase);
        const usuarios = [{ id: 1, nombre: 'federico', activo: true }, { id: 2, nombre: 'gaston', activo: false }];
        const activos = IterationMethods.obtenerUsuariosActivos(usuarios);
        return { preciosIVA: preciosConIVA, usuariosActivos: activos };
    },
    transformMethods: () => {
        const carrito = [{ producto: 'Teclado', precio: 50, cantidad: 2 }];
        const total = TransformMethods.calcularTotalCarrito(carrito);
        const desordenados = [40, 10, 100];
        const ordenados = TransformMethods.ordenarNumerosAsc(desordenados);
        return { totalCompra: total, numerosOrdenados: ordenados };
    }
};

// Función para renderizar o eliminar un resultado (Toggle)
const toggleResult = (category, title) => {
    const container = document.getElementById('results-container');
    const existingCard = document.getElementById(`card-${category}`);

    if (existingCard) {
        // Si ya existe, lo eliminamos (Toggle Off)
        existingCard.remove();
        return false;
    }

    // Ejecutar lógica del módulo
    const data = executionMap[category]();

    // Crear nueva card (Toggle On)
    const cardCol = document.createElement('div');
    cardCol.className = 'col-md-8 col-lg-6 animate-fade-in';
    cardCol.id = `card-${category}`;

    cardCol.innerHTML = `
        <div class="card shadow-lg border-primary">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${title}</h5>
                <button type="button" class="btn-close btn-close-white" aria-label="Close" onclick="this.closest('.card').parentElement.remove()"></button>
            </div>
            <div class="card-body">
                <div class="result-box">
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>
            </div>
        </div>
    `;
    container.appendChild(cardCol);
    return true;
};

// Configurar listeners para los botones
document.querySelectorAll('.active-toggle').forEach(button => {
    button.addEventListener('click', (e) => {
        const category = e.target.getAttribute('data-category');
        const title = e.target.innerText;
        
        const isActive = toggleResult(category, title);
        
        // Estética del botón
        if (isActive) {
            e.target.classList.replace('btn-outline-primary', 'btn-primary');
        } else {
            e.target.classList.replace('btn-primary', 'btn-outline-primary');
        }
    });
});

console.log("🚀 JS Arrays Master: Interactividad activada.");
