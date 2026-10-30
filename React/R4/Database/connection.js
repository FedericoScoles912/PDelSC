// =============================================
// Pool de conexiones MySQL / TiDB Cloud con mysql2/promise.
//
// Soporta dos formas de configuración (en este orden de prioridad):
//   1. DATABASE_URL = mysql://usuario:contraseña@host:4000/portfolio_db
//   2. Variables separadas DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD
//
// TLS: TiDB Cloud (endpoint público) exige conexión cifrada. Se activa con
// `DB_SSL=true` o de forma automática cuando el host pertenece a tidbcloud.com.
// =============================================

import mysql from 'mysql2/promise';

// Opciones exigidas por TiDB Cloud (Serverless y Dedicated con endpoint público)
const SSL_OPTIONS = { minVersion: 'TLSv1.2', rejectUnauthorized: true };

// Ajustes pensados para entornos serverless (Vercel): pools chicos y keep-alive
const POOL_OPTIONS = {
  waitForConnections: true,
  connectionLimit: 5,
  enableKeepAlive: true,
};

function requiresTls(host = '') {
  return (
    String(process.env.DB_SSL || '').toLowerCase() === 'true' ||
    /(^|\.)tidbcloud\.com$/i.test(host)
  );
}

// Convierte la cadena mysql:// en el objeto de configuración de mysql2.
// Se parsea a mano porque mysql2 no aplica TLS a partir del parámetro `ssl`.
function configFromUrl(rawUrl) {
  const url = new URL(rawUrl);
  const host = url.hostname;
  return {
    host,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\/+/, '')),
    ...(requiresTls(host) ? { ssl: SSL_OPTIONS } : {}),
  };
}

function configFromEnv() {
  const host = process.env.DB_HOST;
  return {
    host,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ...(requiresTls(host) ? { ssl: SSL_OPTIONS } : {}),
  };
}

const pool = mysql.createPool({
  ...(process.env.DATABASE_URL ? configFromUrl(process.env.DATABASE_URL) : configFromEnv()),
  ...POOL_OPTIONS,
});

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return { rows, insertId: rows.insertId };
}

export default { query };
