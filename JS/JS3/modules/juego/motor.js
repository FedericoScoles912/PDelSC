import { obtenerDireccion, establecerUltimaDireccion } from './input.js';
import { verificarColisionParedes, verificarColisionCuerpo, verificarColisionComida } from './colisiones.js';

export function crearJugador(equipo, xInicial, yInicial) {
  console.log('🏃 crearJugador() equipo:', equipo, 'posicion inicial:', xInicial, yInicial);
  return {
    nombre: '',
    equipo,
    tren: [
      { x: xInicial, y: yInicial },
      { x: xInicial - 1, y: yInicial },
      { x: xInicial - 2, y: yInicial }
    ],
    puntaje: 0,
    tiempo: 0
  };
}

export function generarComida(ancho, alto, jugador) {
  console.log('🍎 generarComida() ancho:', ancho, 'alto:', alto);
  let comida;
  let colisiona = true;
  while (colisiona) {
    comida = {
      x: Math.floor(Math.random() * (ancho - 2)) + 1,
      y: Math.floor(Math.random() * (alto - 2)) + 1
    };
    colisiona = jugador.tren.some(segmento => segmento.x === comida.x && segmento.y === comida.y);
  }
  console.log('✅ Comida generada en:', comida);
  return comida;
}

export function actualizarJuego(jugador, comida, anchoCanvas, altoCanvas, tamanoCelda) {
  console.log('🔄 actualizarJuego() jugador:', jugador.nombre);
  const direccion = obtenerDireccion();
  establecerUltimaDireccion(direccion);

  const cabeza = {
    x: jugador.tren[0].x + direccion.x,
    y: jugador.tren[0].y + direccion.y
  };
  console.log('🐍 Cabeza en:', cabeza);

  if (
    verificarColisionParedes(cabeza, anchoCanvas, altoCanvas, tamanoCelda) ||
    verificarColisionCuerpo(cabeza, jugador.tren)
  ) {
    console.log('💀 Game Over!');
    return { gameOver: true, jugador, comida };
  }

  jugador.tren.unshift(cabeza);

  if (verificarColisionComida(cabeza, comida)) {
    console.log('🍎 Comida comida!');
    jugador.puntaje++;
    return { gameOver: false, jugador, comida: null };
  } else {
    jugador.tren.pop();
    return { gameOver: false, jugador, comida };
  }
}
