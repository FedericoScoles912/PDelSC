# Manual de Usuario — Sistema de Control de Stock (Retenes EMIC)

Guía de uso de la aplicación, disponible como **app Android (APK)** y como
**aplicación web para PC**. La interfaz se adapta automáticamente al tamaño de pantalla:

- **PC / Tablet (≥ 1024 px):** barra lateral de navegación fija + barra superior.
- **Teléfono (< 1024 px):** barra superior con menú desplegable (drawer).

> La aplicación respeta el modo **claro/oscuro** del sistema y permite alternarlo desde la
> barra superior.

---

## Índice

1. [Ingreso al sistema](#1-ingreso-al-sistema)
2. [Registro de usuario](#2-registro-de-usuario)
3. [Inicio de sesión social](#3-inicio-de-sesión-social)
4. [Navegación y roles](#4-navegación-y-roles)
5. [Dashboard](#5-dashboard)
6. [Productos (ABM)](#6-productos-abm)
7. [Búsqueda por medidas](#7-búsqueda-por-medidas)
8. [Movimientos de stock](#8-movimientos-de-stock)
9. [Precios](#9-precios)
10. [Reportes](#10-reportes)
11. [Usuarios](#11-usuarios)
12. [Auditoría](#12-auditoría)
13. [Configuración](#13-configuración)
14. [Sistema de avisos](#14-sistema-de-avisos)
15. [Preguntas frecuentes](#15-preguntas-frecuentes)

---

## 1. Ingreso al sistema

1. Abrir la aplicación (APK o web).
2. Ingresar **correo electrónico** y **contraseña**.
3. Presionar **Iniciar sesión**.

Si las credenciales son correctas, se accede al **Dashboard**. La sesión se guarda de forma
segura en el dispositivo y se **restaura automáticamente** al volver a abrir la app (no hace
falta volver a loguearse hasta que expire o se cierre sesión).

**Usuarios de prueba** (creados por el script semilla):

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `admin@retenes.com` | `Admin123!` |
| Encargado de Depósito | `deposito@retenes.com` | `Deposito123!` |
| Vendedor | `vendedor@retenes.com` | `Vendedor123!` |

---

## 2. Registro de usuario

Desde la pantalla de ingreso, tocar **“Crear cuenta”** y completar:

- **Nombre** y **Apellido** (mínimo 2 caracteres).
- **Email** válido.
- **Contraseña** que cumpla la política mínima (longitud y complejidad).
- **Confirmación** de contraseña.

Al confirmar, la cuenta se crea y se inicia sesión automáticamente.

---

## 3. Inicio de sesión social

El sistema soporta autenticación con **Google**, **Facebook** y **GitHub**. En la pantalla de
ingreso, usar los botones de proveedor. Si el proveedor no está configurado en el servidor,
la aplicación mostrará un aviso indicando que el inicio social no está disponible.

---

## 4. Navegación y roles

La barra lateral (o el menú en el teléfono) muestra **sólo las secciones permitidas** según el
rol del usuario:

| Sección | Administrador | Encargado de Depósito | Vendedor |
|---------|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| Productos | ✅ | ✅ | ✅ (sólo consulta) |
| Búsqueda por medidas | ✅ | ✅ | ✅ |
| Movimientos | ✅ | ✅ | ✅ (puede registrar egresos) |
| Precios | ✅ | ✅ | ❌ |
| Reportes | ✅ | ✅ | ✅ |
| Usuarios | ✅ | ❌ | ❌ |
| Auditoría | ✅ | ❌ | ❌ |
| Configuración | ✅ | ❌ | ❌ |

> Aunque un usuario intente acceder por URL/API a una sección no permitida, el **backend
> rechaza** la operación con un error de permisos (**403**).

Para **cerrar sesión**, usar el botón correspondiente en la barra superior.

---

## 5. Dashboard

Pantalla inicial con los **indicadores clave** del inventario:

- **Total de productos** y **productos activos**.
- **Valor total del stock** (unidades × precio de lista) y **unidades totales**.
- **Productos con stock bajo** (por debajo del mínimo) y **alertas pendientes**.
- **Próximos ingresos** (productos marcados como “próximo ingreso”).
- **Resumen por categoría** (cantidad y valor).
- **Últimos movimientos** y **últimos cambios de precio**.

Los valores se actualizan al entrar a la pantalla o al refrescar.

---

## 6. Productos (ABM)

Listado del catálogo con **buscador** y **filtros** (categoría, giro, código, texto, estado,
“stock bajo”), y **paginación**.

### Ver / consultar
- Todos los usuarios pueden listar y ver el detalle de los productos.

### Crear / modificar (Administrador y Encargado de Depósito)
Botón **“Nuevo producto”** (o “Editar” en una fila). Campos principales:

| Campo | Descripción |
|-------|-------------|
| **Código** | Código interno del producto (obligatorio, único). |
| **Categoría** | Sección a la que pertenece. |
| **Lanzamiento** | Línea o lanzamiento comercial. |
| **Medidas** | Eje, alojamiento y altura (texto y valor numérico en mm). |
| **Giro** | Orientación / tipo de giro. |
| **UxB** | Unidades por bulto. |
| **Precio de lista** | Precio unitario. |
| **Stock mínimo** | Umbral para disparar alertas. |
| **Stock inicial** | Sólo al crear (genera el stock de arranque). |
| **Próximo ingreso** | Marca el producto como pendiente de ingreso. |
| **Equivalencias** | Códigos OEM / alternativos (separados por coma). |
| **Observaciones** | Notas libres. |

### Stock mínimo
En la fila de un producto (Admin/Depósito) puede fijarse el **stock mínimo** con el botón
correspondiente.

### Eliminar (sólo Administrador)
Botón **“Eliminar”** en la fila del producto. Requiere confirmación; la acción queda registrada
en la auditoría.

---

## 7. Búsqueda por medidas

Búsqueda avanzada pensada para el mostrador. Permite combinar criterios:

- **Código** exacto / parcial.
- **Medidas** (Eje, Alojamiento, Altura) con una **tolerancia** en milímetros (por defecto
  `0.5` mm, configurable). Por ejemplo, buscar eje `30` con tolerancia `0.5` devuelve todos los
  productos cuyo eje esté entre `29.5` y `30.5`.
- **OEM**: código equivalente del fabricante.
- **Texto libre**: busca en código, medidas y observaciones.

Los resultados muestran los productos coincidentes con sus medidas, stock y precio.

---

## 8. Movimientos de stock

Registro histórico de **ingresos**, **egresos** y **ajustes**, con filtros por producto, tipo y
rango de fechas.

### Consultar
Todos los usuarios pueden ver el historial y los **últimos movimientos**.

### Registrar un movimiento
Disponible para Administrador, Encargado de Depósito y Vendedor (el Vendedor lo usa para
**egresos por venta**). Pasos:

1. Tocar **“Registrar movimiento”**.
2. **Buscar y seleccionar** el producto.
3. Elegir el **tipo**:
   - **INGRESO** — suma unidades al stock.
   - **EGRESO** — resta unidades (ventas, pérdidas, etc.).
   - **AJUSTE** — fija el stock a un valor (recuento físico).
4. Indicar la **cantidad** y un **motivo** (opcional) y **referencia** (opcional, ej. n.º de
   remito o venta).
5. Confirmar.

El sistema actualiza el stock **de forma transaccional** (no pueden quedar stocks
inconsistentes) y muestra el **stock anterior y el nuevo**. Si el nuevo stock queda por debajo
del mínimo, se genera automáticamente una **alerta**.

---

## 9. Precios

Disponible para **Administrador** y **Encargado de Depósito**.

- **Seleccionar un producto** y ver su **historial de precios** (valor anterior, nuevo, fecha,
  usuario y origen del cambio).
- **Actualizar el precio** de lista; cada cambio queda registrado en el historial.
- **Importar lista de precios desde Excel** (sólo Administrador):
  1. Elegir el archivo `.xlsx`.
  2. Ver la **vista previa** (cantidad de productos nuevos/existentes y una muestra).
  3. **Confirmar** la importación.

---

## 10. Reportes

Disponible para todos los roles. Tres pestañas:

- **Stock** — listado de productos con existencias, mínimo y estado.
- **Movimientos** — histórico de movimientos con filtros.
- **Valorización** — valor total del inventario y desglose por categoría.

Cada reporte puede **exportarse a CSV** (descarga directa en la web; en móvil se comparte el
contenido generado). Los CSV pueden abrirse con Excel.

---

## 11. Usuarios

Sección exclusiva del **Administrador**.

- **Listar** usuarios con buscador y paginación.
- **Crear** usuario: nombre, apellido, email, contraseña y **rol**.
- **Editar** datos del usuario.
- **Activar / desactivar** la cuenta (una cuenta desactivada no puede iniciar sesión).
- **Cambiar rol** entre Administrador, Encargado de Depósito y Vendedor.
- **Eliminar** usuario.

---

## 12. Auditoría

Sección exclusiva del **Administrador**. Bitácora cronológica de las operaciones sensibles
(creación/edición/baja de productos, usuarios, precios, importaciones). Cada registro muestra:

- **Fecha**, **usuario** y **acción**.
- **Entidad** afectada y su identificador.
- **Datos antes / después** (JSON) cuando corresponde.
- **IP** de origen.

---

## 13. Configuración

Sección exclusiva del **Administrador**. Parámetros generales del sistema (clave–valor):

- `nombre_empresa`, `moneda`.
- `tolerancia_medidas` (tolerancia por defecto de la búsqueda por medidas).
- `alertas_activas` (activar/desactivar el motor de alertas).
- `stock_minimo_default` (mínimo por defecto al crear productos).
- `vigencia_lista` (fecha de vigencia de la lista de precios).

Editar un valor y guardar. Los cambios impactan de inmediato en el comportamiento del sistema.

---

## 14. Sistema de avisos

La aplicación **no utiliza ventanas nativas del navegador/OS**. Todas las notificaciones son
propias:

- **Toasts** (mensajes breves) para confirmaciones y avisos, en verde (éxito), rojo (error) o
  ámbar (advertencia).
- **Diálogos** para confirmaciones (por ejemplo, eliminar un producto) y para errores que
  requieren atención.

---

## 15. Preguntas frecuentes

**No puedo iniciar sesión y las credenciales son correctas.**
Verificar que el backend esté levantado y accesible. En el teléfono físico, comprobar que
`EXPO_PUBLIC_API_URL` apunte a la **IP LAN de la PC** y que ambos estén en la misma red.

**La sesión se cierra sola.**
Es normal si el *refresh token* expiró (7 días) o fue revocado. Volver a iniciar sesión.

**Un botón no aparece / una sección no está en el menú.**
El menú se filtra por rol. Esas funciones corresponden a un rol con más permisos.

**No se genera la alerta de stock.**
Revisar que `alertas_activas` esté en `1` en **Configuración** y que el producto tenga un
**stock mínimo** definido.

**Los montos se ven sin formato.**
Verificar `moneda` en **Configuración**.
