let direccion = { x: 0, y: 0 };
let ultimaDireccion = { x: 0, y: 0 };

export function inicializarInput() {
  direccion = { x: 1, y: 0 };
  ultimaDireccion = { x: 1, y: 0 };
}

export function manejarTeclado(evento) {
  switch (evento.key) {
    case 'ArrowUp':
      if (ultimaDireccion.y !== 1) direccion = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
      if (ultimaDireccion.y !== -1) direccion = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
      if (ultimaDireccion.x !== 1) direccion = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
      if (ultimaDireccion.x !== -1) direccion = { x: 1, y: 0 };
      break;
  }
}

export function manejarTactil(direccionTactil) {
  switch (direccionTactil) {
    case 'arriba':
      if (ultimaDireccion.y !== 1) direccion = { x: 0, y: -1 };
      break;
    case 'abajo':
      if (ultimaDireccion.y !== -1) direccion = { x: 0, y: 1 };
      break;
    case 'izquierda':
      if (ultimaDireccion.x !== 1) direccion = { x: -1, y: 0 };
      break;
    case 'derecha':
      if (ultimaDireccion.x !== -1) direccion = { x: 1, y: 0 };
      break;
  }
}

export function obtenerDireccion() {
  return direccion;
}

export function establecerUltimaDireccion(nuevaDireccion) {
  ultimaDireccion = { ...nuevaDireccion };
}
