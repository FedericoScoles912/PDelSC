# Manual de Usuario — Stocker (Sistema de Control de Stock)

Bienvenido al **Manual de Usuario** de **Stocker — Sistema de Control de Stock**, una plataforma integral multiplataforma (**Web, Android e iOS**) diseñada para la gestión de inventario, catálogo técnico de retenes y sellos automotrices, listas de precios, movimientos de depósito, reportes y auditoría.

---

## Índice

1. [Descripción General](#1-descripción-general)
2. [Acceso al Sistema e Inicio de Sesión](#2-acceso-al-sistema-e-inicio-de-sesión)
3. [Configuración de Claves OAuth Social (Google, Facebook y GitHub)](#3-configuración-de-claves-oauth-social-google-facebook-y-github)
4. [Roles de Usuario y Matriz de Permisos](#4-roles-de-usuario-y-matriz-de-permisos)
5. [Interfaz General, Navegación y Tema Visual](#5-interfaz-general-navegación-y-tema-visual)
6. [Guía de Módulos del Sistema](#6-guía-de-módulos-del-sistema)
   - [6.1 Panel (Dashboard)](#61-panel-dashboard)
   - [6.2 Productos y Búsqueda por Medidas](#62-productos-y-búsqueda-por-medidas)
   - [6.3 Movimientos de Stock](#63-movimientos-de-stock)
   - [6.4 Precios y Ajustes Masivos](#64-precios-y-ajustes-masivos)
   - [6.5 Categorías](#65-categorías)
   - [6.6 Reportes y Exportaciones](#66-reportes-y-exportaciones)
   - [6.7 Importar Excel](#67-importar-excel)
   - [6.8 Usuarios](#68-usuarios)
   - [6.9 Auditoría](#69-auditoría)
   - [6.10 Mi Cuenta (Perfil)](#610-mi-cuenta-perfil)
7. [Generación e Instalación del APK en Android](#7-generación-e-instalación-del-apk-en-android)
8. [Preguntas Frecuentes y Solución de Problemas](#8-preguntas-frecuentes-y-solución-de-problemas)

---

## 1. Descripción General

El sistema permite administrar el catálogo oficial de **Retenes EMIC** (365 productos base distribuidos en 5 categorías y más de 550 códigos de equivalencia OEM/alternativos), brindando:

- **Búsqueda técnica dimensional:** localización inmediata de retenes por medidas de **Eje**, **Alojamiento** y **Altura** (con tolerancia en milímetros) y **Sentido de giro**.
- **Control de inventario en tiempo real:** registro trazable de ingresos, egresos y ajustes con cálculo automático de stock resultante y alertas de stock mínimo.
- **Gestión comercial de precios:** actualización individual o porcentual masiva por categoría con historial completo de variaciones.
- **Trazabilidad y seguridad:** control de acceso basado en roles y bitácora de auditoría de todas las operaciones críticas.

---

## 2. Acceso al Sistema e Inicio de Sesión

Al abrir la aplicación, el sistema verifica automáticamente si existe una sesión activa guardada en el dispositivo:

- Si la sesión sigue vigente, ingresará directamente al **Panel** principal.
- Si no hay sesión activa, se mostrará la pantalla de **Iniciar sesión**.

### 2.1 Ingreso con Correo y Contraseña

1. Ingrese su **Correo electrónico** (por ejemplo, `admin@retenes.com`).
2. Ingrese su **Contraseña**.
3. Presione el botón **Ingresar**.

> **Nota:** Si alguno de los datos es inválido o la cuenta se encuentra desactivada, se mostrará un cuadro de aviso en pantalla (el sistema utiliza diálogos propios integrados, sin alertas nativas del navegador).

### 2.2 Cuentas Iniciales de Prueba

Si la base de datos fue inicializada con las semillas por defecto (`04_seed_roles_admin.sql`), puede utilizar las siguientes credenciales de prueba:

| Rol | Correo Electrónico | Contraseña Inicial |
| :--- | :--- | :--- |
| **Administrador** | `admin@retenes.com` | `Admin123!` |
| **Encargado de depósito** | `deposito@retenes.com` | `Deposito123!` |
| **Vendedor / Consulta** | `vendedor@retenes.com` | `Vendedor123!` |

> **Importante:** Por seguridad, cambie estas contraseñas desde **Mi cuenta** o desde el módulo **Usuarios** antes de pasar a un entorno productivo.

### 2.3 Ingreso con Proveedores Sociales (OAuth)

El sistema soporta autenticación mediante cuentas de **Google**, **Facebook** y **GitHub** (`POST /api/v1/auth/oauth/:proveedor`):

- Si el correo del proveedor coincide con un usuario ya registrado en el sistema, la cuenta social se vincula automáticamente a dicho usuario conservando su rol actual.
- Si es la primera vez que ingresa y el correo no existe en la base de datos, el sistema crea automáticamente una cuenta activa con el rol **Vendedor**.

---

## 3. Configuración de Claves OAuth Social (Google, Facebook y GitHub)

Para habilitar el inicio de sesión social en el archivo `.env` del servidor, el administrador debe registrar la aplicación en cada consola de desarrollador y completar las siguientes variables en `.env`:

```dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
OAUTH_CALLBACK_BASE_URL=http://localhost:4000
```

A continuación se detalla cómo obtener cada par de claves:

### 3.1 Google (`GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`)

1. Ingrese a [Google Cloud Console — Credentials](https://console.cloud.google.com/apis/credentials) con su cuenta de Google.
2. Cree un proyecto nuevo (ej. `Retenes EMIC`) o seleccione uno existente.
3. En el menú lateral, vaya a **APIs y servicios → Pantalla de consentimiento de OAuth**:
   - Seleccione tipo **Externo** → **Crear**.
   - Complete el nombre de la aplicación (`Retenes EMIC`), correo de asistencia y correo de contacto del desarrollador → **Guardar y continuar**.
4. Vaya a **APIs y servicios → Credenciales** → presione **+ Crear credenciales** → **ID de cliente de OAuth**.
5. Seleccione **Aplicación web** como tipo de aplicación:
   - **Orígenes de JavaScript autorizados:**
     - `http://localhost:8081`
     - `http://localhost:19006`
     - `http://localhost:4000`
   - **URI de redireccionamiento autorizados:**
     - `http://localhost:4000/api/v1/auth/oauth/google`
6. Presione **Crear** y copie el **ID de cliente** (`GOOGLE_CLIENT_ID`) y el **Secreto del cliente** (`GOOGLE_CLIENT_SECRET`) en su archivo `.env`.

### 3.2 Facebook (`FACEBOOK_CLIENT_ID` y `FACEBOOK_CLIENT_SECRET`)

1. Ingrese a [Meta for Developers — Mis Aplicaciones](https://developers.facebook.com/apps/) e inicie sesión.
2. Haga clic en **Crear app**:
   - Seleccione el caso de uso **Autenticar y solicitar datos de usuarios con Facebook Login** → **Siguiente**.
   - Elija tipo **Consumidor** (o **Ninguno**) y asigne el nombre `Retenes EMIC`.
3. Dentro del panel de la app, diríjase a **Casos de uso → Autenticación y creación de cuentas → Configurar** → **Configuración** de Facebook Login:
   - En **URI de redireccionamiento de OAuth válidos**, agregue:
     - `http://localhost:4000/api/v1/auth/oauth/facebook`
4. En el menú izquierdo, vaya a **Configuración de la app → Básica**:
   - Copie el **Identificador de la app** en `FACEBOOK_CLIENT_ID`.
   - Presione **Mostrar** en **Clave secreta de la app** y cópiela en `FACEBOOK_CLIENT_SECRET`.

### 3.3 GitHub (`GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET`)

1. Ingrese a [GitHub Developer Settings — OAuth Apps](https://github.com/settings/developers) con su cuenta de GitHub.
2. Haga clic en **New OAuth App** (o **Register a new application**).
3. Complete el formulario:
   - **Application name:** `Retenes EMIC`
   - **Homepage URL:** `http://localhost:8081`
   - **Authorization callback URL:** `http://localhost:4000/api/v1/auth/oauth/github`
4. Haga clic en **Register application**.
5. En la página de la aplicación recién creada:
   - Copie el **Client ID** en `GITHUB_CLIENT_ID`.
   - Haga clic en **Generate a new client secret** y copie el valor generado en `GITHUB_CLIENT_SECRET` (recuerde guardarlo de inmediato, ya que GitHub no vuelve a mostrarlo).

---

## 4. Roles de Usuario y Matriz de Permisos

El menú lateral y las acciones disponibles se adaptan automáticamente según el rol asignado a la cuenta:

| Módulo / Acción | Administrador (`admin`) | Encargado de Depósito (`deposito`) | Vendedor (`vendedor`) |
| :--- | :---: | :---: | :---: |
| **Panel (Dashboard)** | Acceso total | Acceso total | Acceso total |
| **Productos (Consulta y búsqueda)** | Sí | Sí | Sí |
| **Productos (Crear / Editar / Activar / Equivalencias)** | Sí | Sí | No |
| **Productos (Eliminar)** | Sí | No | No |
| **Movimientos de Stock (Ver módulo y alertas)** | Sí | Sí | No (solo registra egresos por venta vía API) |
| **Movimientos de Stock (Ingresos, Egresos y Ajustes)** | Sí | Sí | Solo egresos por venta |
| **Precios (Consulta e historial)** | Sí | Sí | Sí |
| **Precios (Cambio individual y Ajuste masivo %)** | Sí | No | No |
| **Categorías (Crear y Editar)** | Sí | Sí | No |
| **Categorías (Eliminar)** | Sí | No | No |
| **Reportes (Descarga CSV / XLSX)** | Sí | Sí | Visualización |
| **Importar Excel (Previsualizar y Aplicar)** | Sí | No | No |
| **Usuarios (ABM de cuentas y roles)** | Sí | No | No |
| **Auditoría (Bitácora del sistema)** | Sí | No | No |
| **Mi cuenta (Editar perfil y contraseña)** | Sí | Sí | Sí |

---

## 5. Interfaz General, Navegación y Tema Visual

### 5.1 Navegación Adaptativa

La aplicación ajusta su estructura según el tamaño de la pantalla para evitar desbordamientos horizontales:

- **Escritorio (pantallas anchas ≥ 992 px):** Barra lateral fija a la izquierda con iconos, nombres de módulos agrupados por sección (*Operación*, *Gestión*, *Sistema*, *Cuenta*) y tarjeta del usuario activo.
- **Tablets / Ventanas medianas (768 px a 991 px):** Barra lateral compacta que muestra únicamente los iconos representativos de cada módulo.
- **Móviles (< 768 px):** Barra superior con el título del módulo activo y el botón de menú (`☰`) en la esquina superior izquierda, que despliega el panel lateral deslizable.

### 5.2 Modo Claro / Modo Oscuro

En la esquina superior derecha de la pantalla de inicio de sesión —y en la parte inferior de la barra lateral una vez dentro del sistema— encontrará el botón de **Tema** (icono de sol ☀️ o luna 🌙):

- Presiónelo en cualquier momento para alternar entre **Tema Claro** y **Tema Oscuro**.

### 5.3 Cerrar Sesión

1. En la parte inferior de la barra lateral, presione el icono rojo de **Cerrar sesión** (al lado del selector de tema).
2. Confirme la acción en el cuadro de diálogo **¿Querés cerrar la sesión actual?** presionando **Cerrar sesión**.

---

## 6. Guía de Módulos del Sistema

### 6.1 Panel (Dashboard)

Ubicado en **Operación → Panel**, ofrece una vista ejecutiva del estado del inventario:

- **Indicadores generales:** total de productos activos, cantidad de categorías, productos con stock normal, productos bajo stock mínimo y productos agotados (sin stock).
- **Alertas prioritarias:** listado rápido de artículos que requieren reposición inmediata.
- **Actividad reciente:** últimos movimientos de stock e importaciones registradas.

---

### 6.2 Productos y Búsqueda por Medidas

Ubicado en **Operación → Productos**, concentra el catálogo completo de retenes y sellos.

#### Búsqueda Rápida por Texto
- Permite buscar por **código EMIC**, **observaciones/aplicación** (marca/modelo de vehículo o maquinaria) o **código de equivalencia** (`OEM`, `A`, `S`).

#### Búsqueda Técnica por Medidas
Ideal para mostrador o depósito cuando se mide un retén con calibre:
1. Ingrese una o más dimensiones en milímetros:
   - **Eje** (diámetro interior, ej. `25`).
   - **Alojamiento** (diámetro exterior, ej. `47`).
   - **Altura / Espesor** (ej. `7`).
2. Opcionalmente indique una **Tolerancia** en mm (por ejemplo `0.5` para buscar dentro de un rango `± 0.5 mm`).
3. Filtre adicionalmente por **Sentido de giro** (`D` derecho, `I` izquierdo, `B` bidireccional, etc.) o **Categoría**.

#### Filtros Adicionales del Listado
- **Categoría:** filtra por familia de producto.
- **Estado:** activos / inactivos.
- **Etiquetas comerciales:** *Lanzamiento*, *Próximo ingreso*, *Stock bajo* (`stock <= stock_minimo`), *Sin stock* (`stock = 0`).

#### Alta y Edición de Productos *(Administrador y Encargado de depósito)*
Al crear o editar un producto se configuran los siguientes campos:
- **Código:** identificador único del artículo (hasta 32 caracteres).
- **Categoría:** familia a la que pertenece.
- **Medidas:** valores numéricos y textos de `Eje`, `Alojamiento` y `Altura`.
- **Giro y UxB:** sentido de giro y unidades por bolsa (`uxb`).
- **Precio de lista:** valor vigente del producto.
- **Stock y Stock mínimo:** unidades disponibles y umbral de alerta de reposición.
- **Próximo ingreso / Próximo embarque:** indicador y cantidad estimada en tránsito.
- **Equivalencias:** permite agregar o quitar códigos equivalentes clasificados en:
  - `OEM`: código original de terminal automotriz.
  - `A`: código alternativo.
  - `S`: código sustituto / superado.

---

### 6.3 Movimientos de Stock

Ubicado en **Operación → Movimientos** *(disponible para Administrador y Encargado de depósito)*.

#### Registrar un Movimiento
1. Seleccione el **Producto** correspondiente.
2. Elija el **Tipo de movimiento**:
   - **Ingreso:** suma la cantidad indicada al stock actual (compras, recepciones de fábrica, devoluciones de clientes).
   - **Egreso:** descuenta la cantidad indicada del stock actual (ventas, remitos de salida, roturas). *El sistema impide que el stock quede en negativo.*
   - **Ajuste:** establece o corrige el stock según recuento físico de inventario.
3. Ingrese la **Cantidad** (número entero mayor a cero).
4. Complete opcionalmente el **Motivo** (hasta 255 caracteres) y la **Referencia** (número de remito, factura o pedido, hasta 64 caracteres).
5. Confirme la operación: el sistema guarda el movimiento dentro de una transacción segura registrando el **Stock anterior**, la **Cantidad** y el **Stock resultante**.

#### Consulta de Historial y Alertas
- Puede filtrar los movimientos por **producto**, **tipo** (`ingreso`, `egreso`, `ajuste`), **usuario** que lo realizó y **rango de fechas** (`desde` / `hasta`).
- En la vista de **Alertas** se listan todos los productos cuyo stock actual es menor o igual a su stock mínimo configurado.

---

### 6.4 Precios y Ajustes Masivos

Ubicado en **Operación → Precios**. Todos los roles pueden consultar los precios vigentes y su historial; las modificaciones son exclusivas del **Administrador**.

#### Actualización Individual de Precio *(Administrador)*
1. Seleccione el producto deseado.
2. Ingrese el nuevo **Precio de lista** (valor mayor o igual a 0).
3. Indique el **Motivo** del cambio (ej. *Lista vigencia Noviembre*).
4. Al guardar, el sistema actualiza el precio vigente y añade automáticamente un registro en el historial con el precio anterior, el precio nuevo, el usuario y la fecha.

#### Ajuste Masivo Porcentual *(Administrador)*
Permite aplicar aumentos o descuentos porcentuales a todo el catálogo o a una categoría específica:
1. Seleccione una **Categoría** (o déjela en blanco para aplicar a todas las categorías).
2. Ingrese el **Porcentaje** a aplicar (ej. `12.5` para un aumento del 12,5% o `-5` para una rebaja del 5%).
3. Indique la cantidad de decimales en **Redondear a** (entre `0` y `4` decimales).
4. Confirme la operación: se actualizarán todos los productos alcanzados y se registrará la variación en el historial de precios y en la auditoría.

---

### 6.5 Categorías

Ubicado en **Gestión → Categorías** *(Administrador y Encargado de depósito)*.

- Permite visualizar las familias del catálogo (con opción de incluir categorías inactivas).
- **Crear / Editar categoría:** defina el **Nombre** de la categoría, su **Orden** de aparición numérica y su estado **Activo**.
- **Eliminar categoría:** disponible únicamente para el **Administrador**.

---

### 6.6 Reportes y Exportaciones

Ubicado en **Gestión → Reportes**. Permite exportar información actualizada del sistema en formatos **Excel (`.xlsx`)** o **Valores separados por comas (`.csv`)**:

1. **Reporte de Productos:** catálogo completo con medidas, categoría, precios y estado.
2. **Reporte de Stock:** existencias actuales, stock mínimo y estado de reposición.
3. **Reporte de Movimientos:** detalle histórico de entradas, salidas y ajustes (permite filtrar por fecha **Desde** y **Hasta**).
4. **Reporte de Precios:** historial de cambios de precios (permite filtrar por fecha **Desde** y **Hasta**).

---

### 6.7 Importar Excel

Ubicado en **Gestión → Importar Excel** *(exclusivo Administrador)*. Permite actualizar masivamente el catálogo a partir de la planilla oficial de precios de EMIC (`Retenes_EMIC__Lista_de_Precios_-_Vigencia_01_Nov_2025.xlsx`).

El proceso se realiza siempre en **dos pasos** para evitar sobrescrituras accidentales:

1. **Paso 1 — Previsualizar (`Preview`):**
   - Analiza el archivo Excel sin modificar la base de datos.
   - Muestra el resumen de categorías detectadas, productos nuevos a insertar, productos existentes a actualizar, equivalencias y posibles filas descartadas o con advertencias.
2. **Paso 2 — Aplicar importación (`Aplicar`):**
   - Una vez revisada la vista previa, presione **Aplicar**.
   - El sistema procesa la carga de forma idempotente (en lotes seguros de 200 filas), registra cambios en el historial de precios sólo cuando el valor cambió y genera un archivo de log detallado.
3. **Consulta de Logs:** desde la misma pantalla puede revisar el registro de las últimas importaciones ejecutadas.

---

### 6.8 Usuarios

Ubicado en **Sistema → Usuarios** *(exclusivo Administrador)*.

- **Listado y filtros:** busque usuarios por nombre o correo, filtre por **Rol** (`admin`, `deposito`, `vendedor`) o por estado (**Activo** / **Inactivo**).
- **Crear usuario:** complete Nombre, Apellido, Teléfono, Correo electrónico, Contraseña inicial (mínimo 8 caracteres) y Rol.
- **Editar usuario:** modifique datos personales, cambie el rol asignado o restablezca la contraseña.
- **Activar / Desactivar cuenta:** suspenda o rehabilite el acceso de un usuario de forma inmediata sin perder su historial de operaciones.
- **Eliminar usuario:** da de baja la cuenta (el sistema impide que un administrador elimine su propia cuenta en uso).

---

### 6.9 Auditoría

Ubicado en **Sistema → Auditoría** *(exclusivo Administrador)*.

Cada acción relevante en el sistema (inicio de sesión, alta/baja/modificación de productos, categorías y usuarios, ajustes de precios, movimientos de stock e importaciones de Excel) queda registrada automáticamente en la bitácora.

- **Filtros disponibles:**
  - **Usuario:** filtra acciones realizadas por un operador específico.
  - **Entidad:** `auth`, `producto`, `categoria`, `movimiento`, `usuario`, `import`.
  - **Acción:** `crear`, `actualizar`, `eliminar`, `movimiento`, `importar`, `cambiar_password`, etc.
  - **Rango de fechas:** `Desde` y `Hasta`.
- Cada registro exhibe la fecha y hora exacta, el usuario responsable, la dirección IP de origen y el detalle de los datos modificados.

---

### 6.10 Mi Cuenta (Perfil)

Ubicado en **Cuenta → Mi cuenta** *(disponible para todos los roles)*.

- **Datos personales:** permite consultar su rol actual y actualizar su **Nombre**, **Apellido** y **Teléfono**.
- **Cambiar contraseña:**
  1. Ingrese su **Contraseña actual**.
  2. Ingrese su **Nueva contraseña** (debe tener al menos **8 caracteres**).
  3. Confirme el cambio. La acción quedará asentada en el registro de auditoría por seguridad.

---

## 7. Generación e Instalación del APK en Android

El proyecto incluye el perfil `preview` en `client/eas.json` listo para generar un instalador nativo `.apk` de Android sin depender de Expo Go.

### 7.1 Generar el archivo `.apk` con EAS Build

1. Instale la herramienta **EAS CLI** globalmente en su PC:
   ```bash
   npm install -g eas-cli
   ```
2. Ingrese a la carpeta del cliente e inicie sesión con su cuenta de Expo (puede crear una gratis en <https://expo.dev/signup>):
   ```bash
   cd client
   eas login
   ```
3. Verifique en `client/eas.json` que `EXPO_PUBLIC_API_URL` dentro del perfil `preview` apunte a la IP LAN de su servidor backend (actualmente `http://10.0.11.139:4000/api/v1`) o a la URL de Render si el backend está desplegado en la nube.
4. Ejecute la compilación del `.apk`:
   ```bash
   eas build --platform android --profile preview
   ```
   - Si es la primera vez que compila, responda `Y` (*Yes*) cuando le consulte si desea crear el proyecto en EAS y generar un **Android Keystore** nuevo.
5. Una vez finalizada la compilación en los servidores de Expo, la terminal mostrará un **código QR** y un **enlace directo de descarga** del archivo `.apk`.

### 7.2 Instalar el `.apk` en el dispositivo Android

1. Escanee el código QR o abra el enlace de descarga desde el navegador de su teléfono Android (o transfiera el archivo `.apk` por cable USB / WhatsApp / Google Drive).
2. Abra el archivo `.apk` descargado:
   - Si Android muestra el aviso **"Por motivos de seguridad, tu teléfono no puede instalar aplicaciones desconocidas de esta fuente"**, toque **Configuración** y active **Permitir desde esta fuente**.
   - Si **Google Play Protect** solicita confirmación por tratarse de una app interna de desarrollo, toque **Más detalles → Instalar de todas formas**.
3. Presione **Instalar** y luego **Abrir**. La aplicación **Retenes EMIC - Stock** quedará instalada en el cajón de aplicaciones de Android.

---

## 8. Preguntas Frecuentes y Solución de Problemas

| Situación | Causa y Solución |
| :--- | :--- |
| **No puedo ver los módulos de Usuarios, Auditoría o Importar Excel** | Esos módulos son exclusivos del rol **Administrador**. Verifique su rol en la parte inferior de la barra lateral o en **Mi cuenta**. |
| **Al registrar un egreso de stock indica error** | Verifique que la cantidad solicitada no supere el stock disponible actual del producto, y que la cantidad sea un número entero positivo. |
| **Soy Vendedor y no puedo registrar un ingreso de stock** | Las cuentas con rol **Vendedor** sólo están autorizadas a registrar **egresos por venta**. Los ingresos y ajustes de inventario deben ser registrados por **Encargado de depósito** o **Administrador**. |
| **La aplicación móvil no conecta con el servidor local** | Si utiliza un teléfono físico con Expo Go, asegúrese de que la PC y el teléfono estén en la misma red Wi-Fi y que `EXPO_PUBLIC_API_URL` apunte a la IP LAN de la PC (`http://192.168.x.x:4000/api/v1`), no a `localhost`. |
| **La primera petición demora unos segundos en responder** | Si la base de datos en **TiDB Cloud Serverless** estuvo inactiva, el cluster entra en reposo automático y despierta en la primera consulta. Las peticiones siguientes responderán de inmediato. |
| **El inicio de sesión con Google, Facebook o GitHub falla** | Verifique que las claves `*_CLIENT_ID` y `*_CLIENT_SECRET` estén cargadas en el archivo `.env` del backend y que las URLs de redirección configuradas en cada consola coincidan con `OAUTH_CALLBACK_BASE_URL`. |

