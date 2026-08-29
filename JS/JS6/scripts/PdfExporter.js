/**
 * @module PdfExporter
 * @description Genera y descarga un PDF con la tabla de posiciones usando jsPDF.
 *   Requiere que window.jspdf.jsPDF haya sido cargado vía CDN.
 *   Encabezado: nombre del juego, fecha/hora de exportación.
 *   Tabla: Posición | Nombre | Puntos | Tiempo | Fecha.
 *   Fila del jugador actual (si se provee nombre) resaltada en color.
 *   Pie de página: número de página.
 *   Archivo descargado: "ahorcado-scores-YYYYMMDD-HHmm.pdf".
 */

/**
 * Formatea segundos a MM:SS (o HH:MM:SS).
 * @param {number} secs
 * @returns {string}
 */
function fmtTime(secs) {
  const s = Math.max(0, Number(secs) || 0) | 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const x = s % 60;
  const pad = n => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(x)}` : `${pad(m)}:${pad(x)}`;
}

/**
 * Formatea una fecha ISO/local en DD/MM/YYYY HH:mm.
 * @param {Date|string|number} d
 * @returns {string}
 */
function fmtDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '-';
  const pad = n => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Devuelve la marca de tiempo para el nombre de archivo.
 * @returns {string} YYYYMMDD-HHmm
 */
function fileTimestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

/**
 * Genera y descarga el PDF con la tabla de scores.
 *
 * @param {Array<{id?:number,nombre:string,puntos:number,tiempo:number,fecha?:string|Date}>} scores
 *   Array de puntuaciones (ya ordenados).
 * @param {string} [playerName=''] Nombre del jugador actual para resaltar su fila
 *   (coincidencia exacta case-insensitive).
 * @throws {Error} Si jsPDF no está cargado (window.jspdf no existe).
 * @example
 *   import { exportScoresToPdf } from './PdfExporter.js';
 *   exportScoresToPdf(scoresArray, 'María López');
 */
export function exportScoresToPdf(scores, playerName = '') {
  if (typeof window === 'undefined' || !window.jspdf || !window.jspdf.jsPDF) {
    throw new Error('jsPDF no está disponible. Verificá tu conexión a internet.');
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;

  const cols = [
    { key: 'pos',    title: 'Posición', w: 70,  align: 'center' },
    { key: 'nombre', title: 'Nombre',   w: 190, align: 'left'   },
    { key: 'puntos', title: 'Puntos',   w: 70,  align: 'right'  },
    { key: 'tiempo', title: 'Tiempo',   w: 75,  align: 'right'  },
    { key: 'fecha',  title: 'Fecha',    w: 120, align: 'left'   },
  ];

  const tableX = margin;
  const tableW = cols.reduce((a, c) => a + c.w, 0);
  const rowH = 26;
  const headerH = 30;

  const data = (Array.isArray(scores) ? scores : []).map((s, i) => ({
    pos:    (i + 1) + '°',
    nombre: String(s.nombre ?? ''),
    puntos: Number(s.puntos) | 0,
    tiempo: fmtTime(s.tiempo),
    fecha:  fmtDate(s.fecha),
    _isPlayer: playerName && String(s.nombre || '').trim().toLowerCase() === String(playerName).trim().toLowerCase(),
  }));

  let y = margin;

  /* ---------- ENCABEZADO ---------- */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(184, 92, 42);
  doc.text('El Ahorcado — Palabras al Límite', pageW / 2, y, { align: 'center' });

  y += 22;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(107, 82, 64);
  doc.text(`Exportado: ${fmtDate(new Date())}`, pageW / 2, y, { align: 'center' });

  y += 34;

  /* ---------- TÍTULO DE TABLA ---------- */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(59, 47, 32);
  doc.text('Tabla de Posiciones', margin, y);
  y += 16;

  /* ---------- FILA HEADER DE TABLA ---------- */
  const drawHeader = (yy) => {
    doc.setFillColor(184, 92, 42);
    doc.rect(tableX, yy, tableW, headerH, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    let xx = tableX;
    cols.forEach(c => {
      const tx =
        c.align === 'right' ? xx + c.w - 8 :
        c.align === 'center' ? xx + c.w / 2 :
        xx + 8;
      doc.text(c.title, tx, yy + headerH / 2 + 4, { align: c.align === 'right' ? 'right' : c.align });
      xx += c.w;
    });
  };

  const drawRow = (row, yy, isHeader = false, highlight = false) => {
    if (highlight) {
      doc.setFillColor(245, 222, 179);
      doc.rect(tableX, yy, tableW, rowH, 'F');
    } else {
      doc.setFillColor(250, 245, 238);
      doc.rect(tableX, yy, tableW, rowH, 'F');
    }

    doc.setTextColor(59, 47, 32);
    doc.setFont('helvetica', highlight ? 'bold' : 'normal');
    doc.setFontSize(10);

    let xx = tableX;
    cols.forEach(c => {
      let v = String(row[c.key] ?? '');
      if (v.length > 30 && c.key === 'nombre') v = v.slice(0, 28) + '…';
      const tx =
        c.align === 'right' ? xx + c.w - 8 :
        c.align === 'center' ? xx + c.w / 2 :
        xx + 8;
      doc.text(v, tx, yy + rowH / 2 + 3, { align: c.align === 'right' ? 'right' : c.align });
      xx += c.w;
    });

    doc.setDrawColor(212, 184, 150);
    doc.setLineWidth(0.5);
    doc.line(tableX, yy + rowH, tableX + tableW, yy + rowH);
    if (isHeader) {
      doc.setDrawColor(184, 92, 42);
      doc.setLineWidth(1);
      doc.line(tableX, yy + rowH, tableX + tableW, yy + rowH);
    }
  };

  /* ---------- PAGINACIÓN BÁSICA ---------- */
  const drawFooter = (pageNum) => {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(158, 133, 106);
    doc.text(`Página ${pageNum}`, pageW - margin, pageH - margin, { align: 'right' });
    doc.line(margin, pageH - margin + 10, pageW - margin, pageH - margin + 10);
  };

  let pageNum = 1;
  drawHeader(y);
  y += headerH;

  if (data.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(158, 133, 106);
    doc.text('No hay puntuaciones para mostrar.', pageW / 2, y + 20, { align: 'center' });
    y += 40;
  } else {
    data.forEach((row, idx) => {
      if (y + rowH > pageH - margin - 24) {
        drawFooter(pageNum++);
        doc.addPage();
        y = margin;
        drawHeader(y);
        y += headerH;
      }
      drawRow(row, y, false, !!row._isPlayer);
      y += rowH;
      void idx;
    });
  }

  drawFooter(pageNum);

  const fileName = `ahorcado-scores-${fileTimestamp()}.pdf`;
  doc.save(fileName);
}
