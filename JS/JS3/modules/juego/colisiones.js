export function verificarColisionParedes(cabeza, anchoCanvas, altoCanvas, tamanoCelda) {
  const columnas = anchoCanvas / tamanoCelda;
  const filas = altoCanvas / tamanoCelda;
  return (
    cabeza.x <= 0 ||
    cabeza.x >= columnas - 1 ||
    cabeza.y <= 0 ||
    cabeza.y >= filas - 1
  );
}

export function verificarColisionCuerpo(cabeza, cuerpo) {
  return cuerpo.some(segmento => segmento.x === cabeza.x && segmento.y === cabeza.y);
}

export function verificarColisionComida(cabeza, comida) {
  return cabeza.x === comida.x && cabeza.y === comida.y;
}
