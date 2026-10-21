# Guion para el video de presentación

Guion sugerido para grabar la demostración del **Sistema de Control de Stock — Retenes EMIC**.
Duración objetivo: **8–10 minutos**.

**Consejos previos**
- Grabar la **versión web a 1920×1080** para la demo en PC y, si hay, mostrar la **app Android**
  en paralelo (o un segmento aparte con el teléfono).
- Tener el **backend levantado** y la **base importada** (365 productos) antes de grabar.
- Preparar una segunda pestaña o ventana con el **código / SQL / diagramas** para las secciones
  técnicas.
- Cerrar notificaciones y usar el modo claro u oscuro de forma consistente.

---

## Escena 0 — Portada (0:00 – 0:20)

> **En pantalla:** Título del proyecto + logos.
> **Narración:** “Sistema de Control de Stock para un distribuidor de retenes y sellos
> automotrices EMIC. Proyecto integrador con app Android, versión web para PC, API REST y base de
> datos MySQL.”

**Presentar el equipo / materia / fecha.**

---

## Escena 1 — Arquitectura y tecnologías (0:20 – 1:30)

> **En pantalla:** Diagrama de arquitectura (de `Docs/Diagramas.md`).

- **Frontend:** React Native + Expo (NativeWind / Tailwind), React Navigation, Redux Toolkit +
  RTK Query. Corre como **APK Android** y **web**.
- **Backend:** Node.js + Express en ES Modules, API REST versionada `/api/v1`, autenticación JWT
  con refresh rotativo, capas (routes → controllers → services → repositories).
- **Base de datos:** MySQL con 13 tablas, vistas, un procedimiento y un trigger.

> **Narración:** “La misma base de código genera la app Android y la interfaz web; todo se
> comunica con un único backend REST.”

---

## Escena 2 — Base de datos y datos reales (1:30 – 2:30)

> **En pantalla:** MySQL Workbench con el esquema y una consulta a `v_stock_actual`.

- Mostrar el **diagrama ER** y las tablas principales (`productos`, `stock`,
  `movimientos_stock`, `historial_precios`, `alertas_stock`, `auditoria`).
- Mostrar la **importación del Excel**: la lista de precios real de EMIC (hoja *“Por Medidas”*)
  cargada como **365 productos** y **558 equivalencias**.

> **Narración:** “Los datos no son ficticios: surgen de la lista de precios oficial de EMIC, que se
> importa automáticamente desde Excel.”

---

## Escena 3 — Login y seguridad (2:30 – 3:30)

> **En pantalla:** Pantalla de Login.

1. Ingresar con `admin@retenes.com` / `Admin123!`.
2. Mostrar la **restauración de sesión**: recargar la página y comprobar que sigue logueado.
3. Mencionar: contraseñas con **bcrypt**, **JWT** con refresh rotativo y revocación, y sistema de
   avisos propio (sin `alert()`).

---

## Escena 4 — Dashboard (3:30 – 4:15)

> **En pantalla:** Dashboard con KPIs.

- Recorrer los indicadores: total y activos, **valor del stock**, unidades, **stock bajo**,
  **alertas**, próximos ingresos, resumen por categoría, últimos movimientos y precios.

---

## Escena 5 — Productos y búsqueda por medidas (4:15 – 5:45)

> **En pantalla:** Módulo Productos + Búsqueda.

1. Listar productos, aplicar **filtros** (categoría, texto) y **paginación**.
2. **Crear** un producto nuevo (mostrar medidas, equivalencias OEM y stock mínimo).
3. Ir a **Búsqueda por medidas** y buscar eje `30` con tolerancia `0.5` → mostrar resultados.
4. Buscar por **OEM** y por **texto libre**.

> **Narración:** “La búsqueda por medidas con tolerancia es clave en el mostrador: permite
> encontrar el retén correcto por sus dimensiones.”

---

## Escena 6 — Movimientos de stock (5:45 – 6:45)

> **En pantalla:** Módulo Movimientos.

1. Registrar un **INGRESO** de, por ejemplo, 10 unidades.
2. Mostrar que el **stock se actualiza** (verificar en Productos) y que aparece el movimiento en
   el **historial** con stock anterior/nuevo y usuario.
3. Registrar un **EGRESO** que deje el producto bajo el mínimo → mostrar la **alerta** en el
   Dashboard.

> **Narración:** “Los movimientos son transaccionales: el stock nunca queda inconsistente, y si
> baja del mínimo se dispara una alerta automática.”

---

## Escena 7 — Precios e historial (6:45 – 7:30)

> **En pantalla:** Módulo Precios.

1. Seleccionar un producto y ver su **historial** de precios.
2. **Actualizar el precio** y comprobar que se registra el cambio con usuario y fecha.
3. (Opcional) Mostrar la **importación de Excel con vista previa**.

---

## Escena 8 — Reportes y exportación (7:30 – 8:15)

> **En pantalla:** Módulo Reportes.

1. Mostrar las pestañas **Stock**, **Movimientos** y **Valorización**.
2. **Exportar a CSV** y abrir el archivo en Excel.

---

## Escena 9 — Roles y permisos (8:15 – 9:00)

> **En pantalla:** Cerrar sesión y entrar como `vendedor@retenes.com` / `Vendedor123!`.

- Mostrar que el **menú se reduce** (sin Precios, Usuarios, Auditoría, Configuración).
- Intentar (o mencionar) que el backend **rechaza** operaciones no permitidas con **403**.

Luego, como Administrador, mostrar **Usuarios**, **Auditoría** y **Configuración** brevemente.

> **Narración:** “Cada rol ve y puede hacer sólo lo que le corresponde, validado tanto en la
> interfaz como en el servidor.”

---

## Escena 10 — App Android (9:00 – 9:30) *(opcional)*

> **En pantalla:** Teléfono con el APK instalado.

- Mostrar login y navegación por el menú desplegable.
- Mencionar la **compilación del APK con EAS Build** y el soporte de **modo claro/oscuro**.

---

## Escena 11 — Cierre (9:30 – 10:00)

> **En pantalla:** Estructura del repositorio + documentación.

- Repasar entregables: **código**, **scripts SQL**, **importador Excel**, **README + API**,
  **Manual de Usuario**, **Guía de Instalación**, **Guía APK**, **diagramas**.
- Mencionar el **control de versiones con Git** y las **buenas prácticas de seguridad**.
- Cierre: “Gracias.” + créditos.

---

## Lista de verificación antes de grabar

- [ ] Backend levantado (`npm start`) y `/health` OK.
- [ ] Base importada (365 productos).
- [ ] `client/.env` bien configurado.
- [ ] Usuario admin y vendedor disponibles para la demo de roles.
- [ ] Un producto con stock 0 listo para demostrar alerta.
- [ ] Notificaciones del sistema silenciadas.
- [ ] Resolución de pantalla en 1920×1080 (o la del dispositivo).
