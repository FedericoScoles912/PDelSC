console.log('🎮 Jugar Solo script cargado');

import { inicializarUI, mostrarModalNombre, actualizarInfoJugador, mostrarContador, ocultarContador, mostrarFinPartida } from '../modules/ui/ui-common.js';
import { inicializarInput, manejarTeclado, manejarTactil, manejarTouchStart, manejarTouchEnd } from '../modules/juego/input.js';
import { crearJugador, generarComida, actualizarJuego } from '../modules/juego/motor.js';
import { dibujarEscenario, dibujarComida, dibujarTren, obtenerTamanoCelda, inicializarImagenes } from '../modules/ui/renderizado.js';
import { guardarPuntuacion } from '../modules/servicios/bd.js';

let ANCHO_CANVAS, ALTO_CANVAS;
let canvas, ctx;
let jugador;
let comida;
let intervaloJuego;
let tiempoInicio;

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM cargado (Jugar Solo)');
    inicializar();
});

function calcularDimensionesCanvas() {
    const TAMANO_CELDA = obtenerTamanoCelda();
    // Calcular espacio disponible teniendo en cuenta la UI (título, botones, etc.)
    const headerHeight = 120;
    const controlsHeight = 180;
    const availableHeight = window.innerHeight - headerHeight - controlsHeight - 20;
    
    const maxAncho = Math.min(window.innerWidth - 20, 1200);
    const maxAlto = Math.min(availableHeight, 800);
    
    // Redondear al múltiplo de TAMANO_CELDA más cercano
    ANCHO_CANVAS = Math.floor(maxAncho / TAMANO_CELDA) * TAMANO_CELDA;
    ALTO_CANVAS = Math.floor(maxAlto / TAMANO_CELDA) * TAMANO_CELDA;
    
    // Asegurar que al menos haya espacio para 10x10 celdas
    ANCHO_CANVAS = Math.max(ANCHO_CANVAS, TAMANO_CELDA * 10);
    ALTO_CANVAS = Math.max(ALTO_CANVAS, TAMANO_CELDA * 10);
}

function inicializar() {
    inicializarUI();
    calcularDimensionesCanvas();
    inicializarCanvas();
    inicializarEventos();
    inicializarImagenes();
    mostrarModalNombre('Ingresa tu Nombre', (nombre) => {
        jugador = crearJugador(1, 3, 3);
        jugador.nombre = nombre;
        iniciarPartida();
    });
    
    // Actualizar canvas al cambiar tamaño de ventana
    window.addEventListener('resize', () => {
        calcularDimensionesCanvas();
        canvas.width = ANCHO_CANVAS;
        canvas.height = ALTO_CANVAS;
        dibujarTodo();
    });
}

function inicializarCanvas() {
    canvas = document.getElementById('canvas-juego');
    ctx = canvas.getContext('2d');
    canvas.width = ANCHO_CANVAS;
    canvas.height = ALTO_CANVAS;
}

function inicializarEventos() {
    document.addEventListener('keydown', manejarTeclado);
    
    const btnArriba = document.getElementById('btn-arriba');
    const btnAbajo = document.getElementById('btn-abajo');
    const btnIzquierda = document.getElementById('btn-izquierda');
    const btnDerecha = document.getElementById('btn-derecha');
    
    if (btnArriba) btnArriba.addEventListener('click', () => manejarTactil('arriba'));
    if (btnAbajo) btnAbajo.addEventListener('click', () => manejarTactil('abajo'));
    if (btnIzquierda) btnIzquierda.addEventListener('click', () => manejarTactil('izquierda'));
    if (btnDerecha) btnDerecha.addEventListener('click', () => manejarTactil('derecha'));
    
    document.getElementById('btn-volver-a-jugar').addEventListener('click', () => {
        // Reset everything and start over
        document.getElementById('fin-partida').classList.add('d-none');
        document.getElementById('nombre-jugador').textContent = jugador.nombre;
        document.getElementById('puntaje-actual').textContent = 'Puntaje: 0';
        iniciarPartida();
    });
    
    // Eventos de deslizamiento (swipe)
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        manejarTouchStart(e);
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        manejarTouchEnd(e);
    }, { passive: false });
}

function iniciarPartida() {
    console.log('🚀 Iniciando partida solo');
    inicializarInput();
    
    jugador.tren = [
        { x: 3, y: 3 },
        { x: 2, y: 3 },
        { x: 1, y: 3 }
    ];
    jugador.puntaje = 0;
    
    const tamanoCelda = obtenerTamanoCelda();
    comida = generarComida(ANCHO_CANVAS / tamanoCelda, ALTO_CANVAS / tamanoCelda, jugador);
    actualizarInfoJugador(jugador.nombre, jugador.puntaje);
    dibujarTodo(); // Draw initial scene
    
    let contador = 3;
    mostrarContador(contador);
    
    const intervaloContador = setInterval(() => {
        contador--;
        if (contador > 0) {
            mostrarContador(contador);
        } else {
            clearInterval(intervaloContador);
            ocultarContador();
            tiempoInicio = Date.now();
            comenzarBucleJuego();
        }
    }, 1000);
}

function comenzarBucleJuego() {
    console.log('🔄 Comenzando bucle de juego (solo)');
    const tamanoCelda = obtenerTamanoCelda();
    let velocidad = 150;
    
    if (intervaloJuego) {
        clearInterval(intervaloJuego);
    }
    
    intervaloJuego = setInterval(() => {
        const resultado = actualizarJuego(jugador, comida, ANCHO_CANVAS, ALTO_CANVAS, tamanoCelda);
        jugador = resultado.jugador;
        
        if (resultado.gameOver) {
            console.log('💀 Game Over (solo)');
            clearInterval(intervaloJuego);
            jugador.tiempo = Date.now() - tiempoInicio;
            finalizarPartida();
        } else {
            if (resultado.comida === null) {
                comida = generarComida(ANCHO_CANVAS / tamanoCelda, ALTO_CANVAS / tamanoCelda, jugador);
                velocidad = Math.max(50, velocidad - 5);
                clearInterval(intervaloJuego);
                comenzarBucleJuego();
            }
            
            actualizarInfoJugador(jugador.nombre, jugador.puntaje);
            dibujarTodo();
        }
    }, velocidad);
}

async function finalizarPartida() {
    await guardarPuntuacion(jugador.nombre, jugador.puntaje, jugador.tiempo);
    mostrarFinPartida('Fin de la Partida', `${jugador.nombre} - Puntaje: ${jugador.puntaje}`);
}

function dibujarTodo() {
    dibujarEscenario(ctx, ANCHO_CANVAS, ALTO_CANVAS);
    dibujarComida(ctx, comida);
    dibujarTren(ctx, jugador);
}
