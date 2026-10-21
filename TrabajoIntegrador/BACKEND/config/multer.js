/**
 * multer.js
 * Configuración de subida de archivos (listas de precios / importación).
 * Sólo acepta .xlsx/.xls y limita el tamaño.
 */
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ApiError from '../utils/ApiError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '../../imports/uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    cb(null, `${stamp}_${file.originalname.replace(/[^\w.-]/g, '_')}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = /\.(xlsx|xls)$/i.test(file.originalname);
  if (!ok) return cb(ApiError.unprocessable('Sólo se aceptan archivos .xlsx o .xls'));
  return cb(null, true);
};

export const uploadExcel = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
});

export default { uploadExcel };
