/**
 * productoImportCore.js
 * Núcleo reutilizable de importación de productos desde el parser de Excel.
 * Lo usan tanto el script CLI (importarExcel.js) como el servicio de importación
 * del backend (importService.js), evitando duplicar la lógica de upsert.
 */

const slugify = (s) =>
  s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 140);

const nz = (v) => (v === undefined ? null : v);

/** Inserta/recupera categoría por nombre (unique). Devuelve el id. */
export async function upsertCategoria(conn, nombre, cache) {
  if (cache.has(nombre)) return cache.get(nombre);
  const slug = slugify(nombre);
  // ON DUPLICATE KEY puede dispararse por `nombre` o por `slug`; el truco
  // LAST_INSERT_ID(id) devuelve el id de la fila existente en ambos casos.
  const [res] = await conn.execute(
    `INSERT INTO categorias (nombre, slug, orden) VALUES (:nombre, :slug, :orden)
     ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), slug = VALUES(slug), id = LAST_INSERT_ID(id)`,
    { nombre, slug, orden: cache.size + 1 },
  );
  const id = res.insertId;
  cache.set(nombre, id);
  return id;
}

/**
 * Inserta o actualiza un producto y sus dependencias dentro de una transacción.
 * @returns {{accion:'insertado'|'actualizado', id:number}}
 */
export async function upsertProducto(conn, p, categoriaCache) {
  let categoriaId = null;
  if (p.categoriaNombre) {
    categoriaId = await upsertCategoria(conn, p.categoriaNombre, categoriaCache);
  }

  const [existentes] = await conn.execute(
    `SELECT id, precio_lista FROM productos WHERE codigo = :codigo`,
    { codigo: p.codigo },
  );
  const existente = existentes[0];

  await conn.execute(
    `INSERT INTO productos
       (codigo, categoria_id, lanzamiento,
        eje_texto, eje_valor, aloj_texto, aloj_valor, alt_texto, alt_valor,
        giro, uxb, observaciones, precio_lista, proximo_ingreso, stock_minimo)
     VALUES
       (:codigo, :categoriaId, :lanzamiento,
        :ejeTexto, :ejeValor, :alojTexto, :alojValor, :altTexto, :altValor,
        :giro, :uxb, :observaciones, :precioLista, :proximoIngreso,
        COALESCE((SELECT valor FROM configuracion WHERE clave='stock_minimo_default'), 5))
     ON DUPLICATE KEY UPDATE
        categoria_id = VALUES(categoria_id),
        lanzamiento  = VALUES(lanzamiento),
        eje_texto = VALUES(eje_texto), eje_valor = VALUES(eje_valor),
        aloj_texto = VALUES(aloj_texto), aloj_valor = VALUES(aloj_valor),
        alt_texto = VALUES(alt_texto), alt_valor = VALUES(alt_valor),
        giro = VALUES(giro), uxb = VALUES(uxb), observaciones = VALUES(observaciones),
        precio_lista = VALUES(precio_lista), proximo_ingreso = VALUES(proximo_ingreso)`,
    {
      codigo: p.codigo,
      categoriaId,
      lanzamiento: nz(p.lanzamiento),
      ejeTexto: nz(p.ejeTexto), ejeValor: nz(p.ejeValor),
      alojTexto: nz(p.alojTexto), alojValor: nz(p.alojValor),
      altTexto: nz(p.altTexto), altValor: nz(p.altValor),
      giro: nz(p.giro), uxb: nz(p.uxb), observaciones: nz(p.observaciones),
      precioLista: nz(p.precioLista), proximoIngreso: p.proximoIngreso,
    },
  );

  const [rows] = await conn.execute(`SELECT id FROM productos WHERE codigo = :codigo`, { codigo: p.codigo });
  const productoId = rows[0].id;

  await conn.execute(`DELETE FROM equivalencias WHERE producto_id = :id`, { id: productoId });
  for (const eq of p.equivalencias) {
    await conn.execute(
      `INSERT IGNORE INTO equivalencias (producto_id, tipo, codigo) VALUES (:id, :tipo, :codigo)`,
      { id: productoId, tipo: eq.tipo, codigo: eq.codigo },
    );
  }

  await conn.execute(`INSERT IGNORE INTO stock (producto_id, cantidad) VALUES (:id, :cantidad)`, {
    id: productoId,
    cantidad: p.stockInicial ?? 0,
  });

  const precioAnterior = existente ? existente.precio_lista : null;
  if (!existente || String(precioAnterior) !== String(p.precioLista)) {
    await conn.execute(
      `INSERT INTO historial_precios (producto_id, precio_anterior, precio_nuevo, origen)
       VALUES (:id, :anterior, :nuevo, 'IMPORTACION')`,
      { id: productoId, anterior: precioAnterior, nuevo: nz(p.precioLista) },
    );
  }

  return { accion: existente ? 'actualizado' : 'insertado', id: productoId };
}

export default { upsertCategoria, upsertProducto };
