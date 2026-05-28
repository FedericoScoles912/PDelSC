console.log('🎮 Jugador 2 script loaded');

import { inicializarUI, actualizarInfoJugador, mostrarContador, ocultarContador, mostrarFinPartida } from '../modules/ui/ui-common.js';
import { inicializarInput, manejarTeclado, manejarTactil } from '../modules/juego/input.js';
import { crearJugador, generarComida, actualizarJuego } from '../modules/juego/motor.js';
import { dibujarEscenario, dibujarComida, dibujarTren, obtenerTamanoCelda, inicializarImagenes } from '../modules/ui/renderizado.js';
import { guardarPuntuacion } from '../modules/servicios/bd.js';

const ANCHO_CANVAS = 400;
const ALTO_CANVAS = 400;

let canvas, ctx;
let jugador;
let jugador1Puntaje;
let jugador1Tiempo;
let jugador1Nombre;
let comida;
let intervaloJuego;
let tiempoInicio;

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM loaded (Jugador 2)');
    inicializar();
});

function inicializar() {
    inicializarUI();
    inicializarCanvas();
    inicializarEventos();
    inicializarImagenes();
    
    jugador1Nombre = localStorage.getItem('1v1_nombre1');
    jugador1Puntaje = parseInt(localStorage.getItem('1v1_puntaje1'));
    jugador1Tiempo = parseInt(localStorage.getItem('1v1_tiempo1'));
    
    const nombre2 = localStorage.getItem('1v1_nombre2');
    jugador = crearJugador(2, 3, 3);
    jugador.nombre = nombre2;
    
    document.getElementById('puntaje-a-batir').textContent = jugador1Puntaje;
    
    iniciarPartida();
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
}

function iniciarPartida() {
    console.log('🚀 Starting jugador 2 turn');
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
    console.log('🔄 Starting game loop (jugador 2)');
    const tamanoCelda = obtenerTamanoCelda();
    let velocidad = 150;
    
    if (intervaloJuego) {
        clearInterval(intervaloJuego);
    }
    
    intervaloJuego = setInterval(() => {
        const resultado = actualizarJuego(jugador, comida, ANCHO_CANVAS, ALTO_CANVAS, tamanoCelda);
        jugador = resultado.jugador;
        
        if (resultado.gameOver) {
            console.log('💀 Game Over (jugador 2)');
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
    
    let titulo, resultado;
    
    if (jugador.puntaje > jugador1Puntaje) {
        titulo = `¡Ganó ${jugador.nombre}!`;
        resultado = `${jugador1Nombre}: ${jugador1Puntaje} pts | ${jugador.nombre}: ${jugador.puntaje} pts`;
    } else if (jugador1Puntaje > jugador.puntaje) {
        titulo = `¡Ganó ${jugador1Nombre}!`;
        resultado = `${jugador1Nombre}: ${jugador1Puntaje} pts | ${jugador.nombre}: ${jugador.puntaje} pts`;
    } else {
        if (jugador.tiempo < jugador1Tiempo) {
            titulo = `¡Ganó ${jugador.nombre}! (Menor tiempo)`;
        } else {
            titulo = `¡Ganó ${jugador1Nombre}! (Menor tiempo)`;
        }
        resultado = `Empate en puntaje! ${jugador1Nombre}: ${jugador1Tiempo}ms | ${jugador.nombre}: ${jugador.tiempo}ms`;
    }
    
    mostrarFinPartida(titulo, resultado);
}

function dibujarTodo() {
    dibujarEscenario(ctx, ANCHO_CANVAS, ALTO_CANVAS);
    dibujarComida(ctx, comida);
    dibujarTren(ctx, jugador);
}
