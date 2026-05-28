// Tamaño de celda responsive: más pequeño en móviles, más grande en escritorio
export function getTamanoCelda() {
    if (window.innerWidth <= 768) {
        return 25; // Móviles
    }
    return 40; // Escritorio y tablets grandes
}

const imagenes = {};

export function inicializarImagenes() {
  const paths = {
    jugador1Cabeza: '/assets/jugador1/cabeza.svg',
    jugador1Cuerpo1: '/assets/jugador1/cuerpo1.svg',
    jugador1Cuerpo2: '/assets/jugador1/cuerpo2.svg',
    jugador2Cabeza: '/assets/jugador2/cabeza.svg',
    jugador2Cuerpo1: '/assets/jugador2/cuerpo1.svg',
    jugador2Cuerpo2: '/assets/jugador2/cuerpo2.svg',
    botella: '/assets/comida/botella.svg'
  };

  for (const [nombre, ruta] of Object.entries(paths)) {
    imagenes[nombre] = new Image();
    imagenes[nombre].src = ruta;
  }
}

export function obtenerTamanoCelda() {
  return getTamanoCelda();
}

export function dibujarEscenario(ctx, anchoCanvas, altoCanvas) {
  const TAMANO_CELDA = getTamanoCelda();
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, anchoCanvas, altoCanvas);
  
  ctx.strokeStyle = '#330033';
  ctx.lineWidth = 1;
  for (let x = 0; x <= anchoCanvas; x += TAMANO_CELDA) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, altoCanvas);
    ctx.stroke();
  }
  for (let y = 0; y <= altoCanvas; y += TAMANO_CELDA) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(anchoCanvas, y);
    ctx.stroke();
  }
  
  ctx.fillStyle = '#9900ff';
  ctx.fillRect(0, 0, anchoCanvas, TAMANO_CELDA);
  ctx.fillRect(0, altoCanvas - TAMANO_CELDA, anchoCanvas, TAMANO_CELDA);
  ctx.fillRect(0, 0, TAMANO_CELDA, altoCanvas);
  ctx.fillRect(anchoCanvas - TAMANO_CELDA, 0, TAMANO_CELDA, altoCanvas);
}

export function dibujarComida(ctx, comida) {
  const TAMANO_CELDA = getTamanoCelda();
  if (imagenes.botella.complete) {
    ctx.drawImage(imagenes.botella, comida.x * TAMANO_CELDA, comida.y * TAMANO_CELDA, TAMANO_CELDA, TAMANO_CELDA);
  } else {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(comida.x * TAMANO_CELDA + 2, comida.y * TAMANO_CELDA + 2, TAMANO_CELDA - 4, TAMANO_CELDA - 4);
  }
}

export function dibujarTren(ctx, jugador) {
  const TAMANO_CELDA = getTamanoCelda();
  jugador.tren.forEach((segmento, index) => {
    let imagen;
    if (jugador.equipo === 1) {
      if (index === 0) {
        imagen = imagenes.jugador1Cabeza;
      } else if (index % 2 === 1) {
        imagen = imagenes.jugador1Cuerpo1;
      } else {
        imagen = imagenes.jugador1Cuerpo2;
      }
    } else {
      if (index === 0) {
        imagen = imagenes.jugador2Cabeza;
      } else if (index % 2 === 1) {
        imagen = imagenes.jugador2Cuerpo1;
      } else {
        imagen = imagenes.jugador2Cuerpo2;
      }
    }

    if (imagen && imagen.complete) {
      ctx.drawImage(imagen, segmento.x * TAMANO_CELDA, segmento.y * TAMANO_CELDA, TAMANO_CELDA, TAMANO_CELDA);
    } else {
      const colores = jugador.equipo === 1 
        ? { cabeza: '#00cc00', cuerpo1: '#ffcc00', cuerpo2: '#009900' }
        : { cabeza: '#0066ff', cuerpo1: '#000099', cuerpo2: '#9900ff' };

      let color;
      if (index === 0) {
        color = colores.cabeza;
      } else if (index % 2 === 1) {
        color = colores.cuerpo1;
      } else {
        color = colores.cuerpo2;
      }
      ctx.fillStyle = color;
      ctx.fillRect(segmento.x * TAMANO_CELDA + 1, segmento.y * TAMANO_CELDA + 1, TAMANO_CELDA - 2, TAMANO_CELDA - 2);
    }
  });
}
