/**
 * @file Genera los íconos oficiales de Stocker (APK Android, iOS, Splash y Favicon Web)
 *       replicando el diseño exacto del proyecto: insignia cobre/naranja (#E87E44)
 *       con el símbolo `aperture-outline` en #14100E.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dirAssets = path.resolve(__dirname, '..', 'client', 'assets');

fs.mkdirSync(dirAssets, { recursive: true });

/** Tabla CRC32 para chunks PNG. */
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function crearChunk(tipo, datos) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(datos.length, 0);
  const tipoBuf = Buffer.from(tipo, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const combinado = Buffer.concat([tipoBuf, datos]);
  crcBuf.writeUInt32BE(crc32(combinado), 0);
  return Buffer.concat([len, tipoBuf, datos, crcBuf]);
}

/**
 * Codifica un buffer RGBA (width * height * 4) como archivo PNG válido.
 */
function codificarPng(width, height, rgba) {
  const firma = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filtro None
    rgba.copy(raw, rowStart + 1, y * stride, (y + 1) * stride);
  }

  const comprimido = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    firma,
    crearChunk('IHDR', ihdr),
    crearChunk('IDAT', comprimido),
    crearChunk('IEND', Buffer.alloc(0))
  ]);
}

/** Distancia firmada a un rectángulo con esquinas redondeadas centrado en (cx, cy). */
function sdfRoundedRect(px, py, cx, cy, halfW, halfH, radius) {
  const qx = Math.abs(px - cx) - (halfW - radius);
  const qy = Math.abs(py - cy) - (halfH - radius);
  const outX = Math.max(qx, 0);
  const outY = Math.max(qy, 0);
  const outside = Math.hypot(outX, outY);
  const inside = Math.min(Math.max(qx, qy), 0);
  return outside + inside - radius;
}

/** Distancia de un punto (px, py) a un segmento (x1, y1) - (x2, y2). */
function distPuntoSegmento(px, py, x1, y1, x2, y2) {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const wx = px - x1;
  const wy = py - y1;
  const c1 = wx * vx + wy * vy;
  if (c1 <= 0) return Math.hypot(px - x1, py - y1);
  const c2 = vx * vx + vy * vy;
  if (c2 <= c1) return Math.hypot(px - x2, py - y2);
  const b = c1 / c2;
  const bx = x1 + b * vx;
  const by = y1 + b * vy;
  return Math.hypot(px - bx, py - by);
}

/**
 * Calcula la distancia firmada al símbolo `aperture-outline` centrado en (cx, cy)
 * con radio exterior `outerR` y grosor de trazo `strokeW`.
 */
function sdfApertureOutline(px, py, cx, cy, outerR, strokeW) {
  const halfStroke = strokeW / 2;

  // 1. Círculo exterior del retén / apertura
  const dCentro = Math.hypot(px - cx, py - cy);
  let minD = Math.abs(dCentro - outerR) - halfStroke;

  // 2. 6 palas tangenciales de `aperture-outline` (Ionicons)
  const innerR = outerR * 0.415;
  const s1 = -innerR / Math.sqrt(3);
  const s2 = Math.sqrt(Math.max(0, outerR * outerR - innerR * innerR));

  for (let k = 0; k < 6; k += 1) {
    const theta = (k * Math.PI) / 3 - Math.PI / 6;
    const nx = Math.cos(theta);
    const ny = Math.sin(theta);
    const tx = -Math.sin(theta);
    const ty = Math.cos(theta);

    const x1 = cx + innerR * nx + s1 * tx;
    const y1 = cy + innerR * ny + s1 * ty;
    const x2 = cx + innerR * nx + s2 * tx;
    const y2 = cy + innerR * ny + s2 * ty;

    const dSeg = distPuntoSegmento(px, py, x1, y1, x2, y2) - halfStroke;
    if (dSeg < minD) minD = dSeg;
  }

  return minD;
}

/** Mezcla suavizada (smoothstep) para anti-aliasing de bordes. */
function coberturaSdf(d, suavizado = 1.2) {
  if (d <= -suavizado) return 1;
  if (d >= suavizado) return 0;
  const t = (d + suavizado) / (2 * suavizado);
  return 1 - t * t * (3 - 2 * t);
}

/**
 * Renderiza un ícono de Stocker.
 * @param {Object} opciones
 * @param {number} opciones.size Tamaño en píxeles (ej. 1024).
 * @param {'full'|'rounded-badge'|'adaptive-fg'} opciones.modo
 */
function renderizarIcono({ size, modo }) {
  const rgba = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;

  // Colores oficiales de Stocker (tokens.ts)
  // Primario: #E87E44 (con sutil gradiente superior #EE8B54 -> inferior #DA6F35)
  // Sobre primario / Trazo: #14100E
  const fgR = 0x14;
  const fgG = 0x10;
  const fgB = 0x0e;

  let outerR = size * 0.31;
  let strokeW = size * 0.056;
  let badgeHalf = size * 0.5;
  let badgeRadius = size * 0.22;

  if (modo === 'adaptive-fg') {
    // En Android Adaptive Icon la zona segura es el 66% central
    outerR = size * 0.225;
    strokeW = size * 0.042;
  } else if (modo === 'rounded-badge') {
    // Para splash-icon y favicon: insignia redondeada igual a InicioSesion.tsx / BarraLateral.tsx
    badgeHalf = size * 0.38;
    badgeRadius = size * 0.16;
    outerR = size * 0.24;
    strokeW = size * 0.045;
  }

  const aa = size >= 512 ? 1.15 : 0.85;

  for (let y = 0; y < size; y += 1) {
    const tGrad = y / Math.max(1, size - 1);
    // Gradiente cálido sutil alrededor de #E87E44
    const bgR = Math.round(0xee * (1 - tGrad) + 0xdc * tGrad);
    const bgG = Math.round(0x88 * (1 - tGrad) + 0x72 * tGrad);
    const bgB = Math.round(0x4e * (1 - tGrad) + 0x38 * tGrad);

    for (let x = 0; x < size; x += 1) {
      const idx = (y * size + x) * 4;
      const px = x + 0.5;
      const py = y + 0.5;

      let baseR = 0;
      let baseG = 0;
      let baseB = 0;
      let baseA = 0;

      if (modo === 'full') {
        baseR = bgR;
        baseG = bgG;
        baseB = bgB;
        baseA = 1;
      } else if (modo === 'rounded-badge') {
        const dBadge = sdfRoundedRect(px, py, cx, cy, badgeHalf, badgeHalf, badgeRadius);
        baseA = coberturaSdf(dBadge, aa);
        baseR = bgR;
        baseG = bgG;
        baseB = bgB;
      } else if (modo === 'adaptive-fg') {
        baseA = 0;
      }

      const dIcon = sdfApertureOutline(px, py, cx, cy, outerR, strokeW);
      const iconAlpha = coberturaSdf(dIcon, aa);

      if (modo === 'adaptive-fg') {
        rgba[idx] = fgR;
        rgba[idx + 1] = fgG;
        rgba[idx + 2] = fgB;
        rgba[idx + 3] = Math.round(iconAlpha * 255);
      } else {
        // Composición de `iconAlpha` sobre el fondo del badge
        const finalA = iconAlpha + baseA * (1 - iconAlpha);
        if (finalA <= 0) {
          rgba[idx] = 0;
          rgba[idx + 1] = 0;
          rgba[idx + 2] = 0;
          rgba[idx + 3] = 0;
        } else {
          const r = (fgR * iconAlpha + baseR * baseA * (1 - iconAlpha)) / finalA;
          const g = (fgG * iconAlpha + baseG * baseA * (1 - iconAlpha)) / finalA;
          const b = (fgB * iconAlpha + baseB * baseA * (1 - iconAlpha)) / finalA;
          rgba[idx] = Math.round(r);
          rgba[idx + 1] = Math.round(g);
          rgba[idx + 2] = Math.round(b);
          rgba[idx + 3] = Math.round(finalA * 255);
        }
      }
    }
  }

  return codificarPng(size, size, rgba);
}

const archivos = [
  { nombre: 'icon.png', size: 1024, modo: 'full' },
  { nombre: 'adaptive-icon.png', size: 1024, modo: 'adaptive-fg' },
  { nombre: 'splash-icon.png', size: 1024, modo: 'rounded-badge' },
  { nombre: 'favicon.png', size: 192, modo: 'rounded-badge' }
];

for (const item of archivos) {
  const destino = path.join(dirAssets, item.nombre);
  const png = renderizarIcono({ size: item.size, modo: item.modo });
  fs.writeFileSync(destino, png);
  console.log(`[OK] Generado ${destino} (${item.size}x${item.size}, ${png.length} bytes)`);
}
