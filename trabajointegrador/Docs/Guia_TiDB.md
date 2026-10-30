# Guía de TiDB Cloud (Serverless) — paso a paso

Esta guía explica cómo crear la base de datos del **Sistema de Control de Stock (EMIC)**
en **TiDB Cloud Serverless**, conectarla desde **MySQL Workbench**, ejecutar las
migraciones del proyecto y dejar el importador de Excel operativo.

TiDB Cloud es compatible con el protocolo de MySQL, por lo que se administra con
MySQL Workbench y el backend se conecta con `mysql2` sin cambios de código.

---

## 1. Crear la cuenta y el cluster

1. Entrar a <https://tidbcloud.com> y crear una cuenta (plan **Serverless**, gratuito).
2. En el panel, **Create Cluster** → elegir **Serverless**.
3. Configurar:
   - **Cluster Name:** `retenes-stock`
   - **Region:** la más cercana (ej. `us-east-1` / `AWS`).
   - **Capacity:** `Serverless` (se ajusta sola).
4. Esperar a que el cluster quede en estado **Available** (1-2 minutos).

> El plan Serverless no requiere tarjeta y tiene cuotas amplias para un proyecto
> académico. Si el cluster se queda inactivo mucho tiempo, se pausa y despierta
> solo en la primera conexión (puede tardar unos segundos).

---

## 2. Obtener las credenciales de conexión

1. Abrir el cluster → pestaña **Connect** → **Standard Connection**.
2. Anotar:
   - **Host:** `gateway01.<region>.prod.aws.tidbcloud.com`
   - **Port:** `4000`
   - **User:** con el formato `xxxxxxxxxx.root` (el prefijo es el **Cluster ID**).
3. Botón **Generate Password** → copiar la contraseña (solo se muestra una vez).
4. Descargar el certificado **CA** (`isrgrootx1.pem`) — TiDB exige TLS.

> Guardar la contraseña en un gestor de secretos. **Nunca** subirla al repositorio.

---

## 3. Configurar el `.env` del proyecto

Copiar `.env.example` a `.env` (solo la primera vez) y completar la sección de base
de datos:

```dotenv
DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=2E8Az5d29oDKBXf.root        # <Cluster ID>.root
DB_PASSWORD=tu_password_generado
DB_NAME=retenes_stock
DB_SSL=true
# Opcional: ruta al CA descargado. Si se omite, Node valida contra las CAs del sistema.
# DB_SSL_CA=./certs/isrgrootx1.pem
DB_POOL_LIMIT=5
```

Reglas críticas de conexión que ya aplica [db.js](../Server/config/db.js):

- **TLS obligatorio:** `ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }`.
- **Pool** con `enableKeepAlive` y reconexión.
- **Reintentos con backoff** (exponencial + jitter) para errores `9007` / `8022`
  (sobrecarga / límite de transacción de TiDB) y bloqueos `1213` / `1205`.
- **Transacciones** con `BEGIN / COMMIT / ROLLBACK` y `SELECT ... FOR UPDATE` para
  escrituras concurrentes (TiDB **no** soporta `SAVEPOINT`).

Verificar la conexión:

```bash
npm run import:excel -- --preview
```

Si la conexión es correcta, el script muestra la vista previa sin escribir nada.

---

## 4. Conectar MySQL Workbench (administración visual)

1. Abrir MySQL Workbench → **+** (New Connection).
2. Completar:
   - **Connection Name:** `TiDB retenes`
   - **Hostname:** el host del paso 2.
   - **Port:** `4000`
   - **Username:** `xxxxxxxxxx.root`
3. Pestaña **SSL** → **Use SSL: Require and Verify CA**:
   - **SSL CA File:** apuntar a `isrgrootx1.pem`.
   - **SSL Cert/Key File:** dejar vacíos.
4. **Test Connection** → ingresar la contraseña → **OK** → **Save**.

> Si Workbench no conecta, probar `Use SSL: Require` (sin verificar CA) para
> descartar problemas del certificado local.

---

## 5. Ejecutar las migraciones (crear tablas y datos)

Los scripts están en `SQL/` y se ejecutan **en este orden**:

| Orden | Archivo                       | Contenido                                                |
| :---: | :---------------------------- | :------------------------------------------------------- |
|   1   | `01_schema.sql`               | Crea la base `retenes_stock` (utf8mb4 / InnoDB).         |
|   2   | `02_tables.sql`               | 11 tablas **con** claves foráneas.                       |
|   2'  | `02b_tables_sin_fk.sql`       | Variante **sin** FK (usar si TiDB rechaza alguna FK).    |
|   3   | `03_indexes.sql`              | Índices B-Tree (búsqueda EJE/ALOJ/ALT por rango `±`).     |
|   4   | `04_seed_roles_admin.sql`     | 3 roles + 3 usuarios de prueba + configuración base.     |
|   5   | `05_views.sql`                | Vistas (`vw_stock_actual`, `vw_productos_bajo_minimo`, …).|
|   6   | `06_seed_productos.sql`       | 365 productos + 5 categorías + equivalencias (por lotes).|
|  —    | `99_rollback.sql`             | DROP ordenado de todo (idempotente).                     |

### Opción A — Script del proyecto (recomendado)

```bash
npm run db:migrate            # ejecuta 01 → 06 en orden
npm run db:migrate -- --sin-fk   # usa 02b (sin FK)
npm run db:rollback           # deshace todo (usa 99)
```

### Opción B — MySQL Workbench

1. Abrir Workbench conectado al cluster de TiDB.
2. **File → Open SQL Script** y abrir cada archivo en el orden de la tabla.
3. Ejecutar con el rayo ⚡ (o `Ctrl+Shift+Enter`).
4. Repetir 1-3 para cada archivo.

> Los scripts usan `CREATE ... IF NOT EXISTS`, `INSERT ... ON DUPLICATE KEY UPDATE`
> e `INSERT IGNORE`, por lo que son **idempotentes**: se pueden re-ejecutar sin
> duplicar datos.

---

## 6. Cargar el Excel de precios

El importador detecta categorías, productos y equivalencias directamente del Excel.

```bash
npm run import:excel -- --preview   # vista previa (no escribe)
npm run import:excel                # importa (UPSERT idempotente)
npm run import:sql                  # solo genera SQL/06_seed_productos.sql
```

- Idempotente por `codigo` (`INSERT ... ON DUPLICATE KEY UPDATE`).
- Procesa en **lotes de 200 filas** dentro de transacciones (límite de TiDB).
- Registra el historial de precios sólo cuando el precio cambia.
- Escribe un log con descartes y advertencias en `imports/logs/`.

---

## 7. Verificación rápida

Ejecutar en Workbench (o en el Script del proyecto):

```sql
SELECT COUNT(*) AS categorias FROM categorias;   -- 5
SELECT COUNT(*) AS productos  FROM productos;     -- 365
SELECT COUNT(*) AS equiv      FROM equivalencias; -- ~558
SELECT COUNT(*) AS usuarios   FROM usuarios;      -- 3
```

Credenciales de prueba creadas por `04_seed_roles_admin.sql`:

| Rol               | Email                      | Contraseña       |
| :---------------- | :------------------------- | :--------------- |
| Administrador     | `admin@retenes.com`        | `Admin123!`      |
| Encargado depósito| `deposito@retenes.com`     | `Deposito123!`   |
| Vendedor / Consulta| `vendedor@retenes.com`    | `Vendedor123!`   |

> Cambiar estas contraseñas antes de cualquier uso real.

---

## 8. Restricciones de TiDB a respetar (ya contempladas en el proyecto)

TiDB Cloud **no** soporta (y el proyecto evita a propósito):

- Stored procedures, triggers, events ni funciones SQL.
- `SAVEPOINT`.
- `FULLTEXT` (se usa índice B-Tree + `LIKE` para búsquedas de texto).
- Depender de `AUTO_INCREMENT` correlativo (se ordena por `creado_en`).
- Transacciones muy grandes (se trabaja por **lotes** con retry/backoff).

La lógica que normalmente iría en triggers/procedimientos vive **en Node.js**
(`Server/`, `Scripts/`), lo que además mantiene la base portable a MySQL.

---

## 9. Solución de problemas

| Síntoma                                              | Causa probable / solución                                                        |
| :--------------------------------------------------- | :------------------------------------------------------------------------------- |
| `SSL/TLS required`                                   | Falta `DB_SSL=true` o el CA. Verificar el paso 3.                                 |
| `Access denied for user`                            | `DB_USER` mal formado: debe ser `<Cluster ID>.root`.                              |
| `Error 9007 / 8022`                                  | Sobrecarga / límite de transacción. El proyecto reintenta solo; reducir lote si persiste.|
| `Error 1105: FOREIGN KEY`                            | TiDB rechazó una FK → usar `02b_tables_sin_fk.sql` (`npm run db:migrate -- --sin-fk`).|
| El cluster está pausado                              | La primera conexión lo despierta (esperar unos segundos y reintentar).             |
| `ETIMEDOUT`                                          | Revisar firewall/red; TiDB usa el puerto `4000`, no `3306`.                        |

---

## 10. Enlaces útiles

- Documentación: <https://docs.pingcap.com/tidbcloud/>
- Consola: <https://tidbcloud.com>
- Límites de Serverless: <https://docs.pingcap.com/tidbcloud/serverless-limitations>
