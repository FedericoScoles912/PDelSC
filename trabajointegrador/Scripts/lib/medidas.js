/**
 * @file Parser de las columnas de MEDIDAS (EJE / ALOJ / ALT).
 *       En el Excel las medidas pueden venir como:
 *         - número entero o decimal           ->  85 / 8,5
 *         - "-" o vacío                        ->  sin dato
 *         - doble medida separada por "/"      ->  "8,5/13,5"  |  "172.0 / 139.7"
 *         - texto con unidades                 ->  "85 MM"
 *       Siempre se guarda el TEXTO original y, cuando hay un valor numérico
 *       interpretable, el DECIMAL del primer número encontrado.
 * @module Scripts/lib/medidas
 */

import { limpiarTexto, aNumero, esVacio } from './texto.js';

/**
 * @typedef {Object} Medida
 * @property {string|null} texto  Texto original normalizado (null si no hay dato).
 * @property {number|null} valor  Primer valor numérico interpretable (null si no aplica).
 */

/**
 * Parsea una celda de medida.
 * @param {*} valor
 * @returns {Medida}
 */
export function parsearMedida(valor) {
  const texto = limpiarTexto(valor);
  if (texto === '' || esVacio(texto)) {
    return { texto: null, valor: null };
  }

  // Doble medida: "172.0 / 139.7" o "8,5/13,5"
  const partes = texto.split('/');
  const primero = partes[0];
  const numero = aNumero(primero);

  return { texto, valor: numero };
}

/**
 * Parsea el trío de medidas de una fila.
 * @param {*} eje
 * @param {*} aloj
 * @param {*} alt
 * @returns {{eje:Medida, aloj:Medida, alt:Medida, tieneMedidas:boolean}}
 */
export function parsearMedidas(eje, aloj, alt) {
  const medidas = {
    eje: parsearMedida(eje),
    aloj: parsearMedida(aloj),
    alt: parsearMedida(alt)
  };
  const tieneMedidas = Object.values(medidas).some((m) => m.texto !== null);
  return { ...medidas, tieneMedidas };
}
