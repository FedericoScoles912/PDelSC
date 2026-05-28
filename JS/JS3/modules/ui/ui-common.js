import { validarNombre } from '../utilidades/validaciones.js';

let modal;
let currentFormListener = null;

export function inicializarUI() {
    console.log('🎨 inicializarUI()');
    const modalElement = document.getElementById('modal-nombre');
    if (modalElement) {
        modal = new bootstrap.Modal(modalElement);
    }
}

export function mostrarModalNombre(titulo, callback) {
    console.log('📝 mostrarModalNombre() titulo:', titulo);
    document.getElementById('modal-titulo').textContent = titulo;
    document.getElementById('error-nombre').textContent = '';
    document.getElementById('input-nombre').value = '';
    
    const form = document.getElementById('form-nombre');
    
    if (currentFormListener) {
        console.log('🧹 Limpiando listener anterior');
        form.removeEventListener('submit', currentFormListener);
    }
    
    currentFormListener = (e) => {
        console.log('📨 Formulario enviado');
        e.preventDefault();
        const inputNombre = document.getElementById('input-nombre');
        const nombre = inputNombre.value.toUpperCase();
        console.log('👤 Nombre ingresado:', nombre);
        
        if (validarNombre(nombre)) {
            console.log('✅ Nombre válido, ocultando modal y llamando callback');
            form.removeEventListener('submit', currentFormListener);
            currentFormListener = null;
            modal.hide();
            callback(nombre);
        } else {
            console.log('❌ Nombre inválido');
            document.getElementById('error-nombre').textContent = 'Nombre inválido: solo 3 letras máximo, solo letras';
        }
    };
    
    form.addEventListener('submit', currentFormListener);
    modal.show();
    console.log('✅ Modal mostrado');
}

export function actualizarInfoJugador(nombre, puntaje) {
    console.log('📊 actualizarInfoJugador() nombre:', nombre, 'puntaje:', puntaje);
    document.getElementById('nombre-jugador').textContent = nombre;
    document.getElementById('puntaje-actual').textContent = `Puntaje: ${puntaje}`;
}

export function mostrarContador(numero) {
    console.log('⏱️ mostrarContador() numero:', numero);
    document.getElementById('contador-inicio').classList.remove('d-none');
    document.getElementById('contador-inicio').classList.add('d-flex', 'align-items-center', 'justify-content-center');
    document.getElementById('numero-contador').textContent = numero;
}

export function ocultarContador() {
    console.log('🙈 ocultarContador()');
    document.getElementById('contador-inicio').classList.add('d-none');
    document.getElementById('contador-inicio').classList.remove('d-flex', 'align-items-center', 'justify-content-center');
}

export function mostrarFinPartida(titulo, resultado) {
    console.log('🏁 mostrarFinPartida() titulo:', titulo, 'resultado:', resultado);
    document.getElementById('fin-partida').classList.remove('d-none');
    document.getElementById('titulo-fin-partida').textContent = titulo;
    document.getElementById('resultado-fin-partida').textContent = resultado;
}
