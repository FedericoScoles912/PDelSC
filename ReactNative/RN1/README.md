# 🔐 Sistema de Acceso de Usuarios Full-Stack

Aplicación completa de autenticación y control de acceso desarrollada con arquitectura desacoplada: **Frontend en React Native + Expo + TypeScript + NativeWind** y **Backend en Node.js + Express + MySQL + Bcrypt**.

---

## 🚀 Tecnologías Principales

- **Frontend:**
  - **React Native & Expo (SDK 52)**: Compatible con Web (PC / Navegadores modernos) y Móvil (iOS / Android mediante Expo Go).
  - **TypeScript (Strict Mode)**: Sin uso de `any`, tipado integral de componentes y navegación.
  - **React Navigation (native-stack)**: Flujo de navegación desacoplado con paso estricto de parámetros.
  - **NativeWind & TailwindCSS**: Estilos utilitarios extendidos con tokens de diseño personalizados.
  - **AsyncStorage**: Persistencia local de preferencias de tema (Claro / Oscuro).
  - **Sistema de Grilla de 12 Columnas**: Componentes `Container`, `Row` y `Col` reactivos con soporte completo para monitores 1920x1080 y teléfonos móviles.
  - **Sistema Modal Propio**: Retroalimentación accesible mediante `PopupContext` y `usePopup()`, sin ningún uso de `alert()` o `Alert.alert()`.

- **Backend:**
  - **Node.js con Módulos ES nativos (`"type": "module"`)**: Todo el código utiliza `import/export`, sin `require()`.
  - **Express.js**: Servidor REST estructurado por capas (Rutas, Controladores, Modelos, Middlewares).
  - **MySQL2 con Promesas**: Pool de conexiones con consultas 100% parametrizadas para inmunidad contra SQL Injection.
  - **Bcrypt**: Cifrado criptográfico unidireccional de contraseñas (salt 10).
  - **CORS & Dotenv**: Configuración segura de orígenes cruzados y variables de entorno.

- **Base de Datos:**
  - **MySQL / MariaDB**: Compatible con XAMPP, WAMP, MAMP, LAMP y servidores cloud.

---

## 📂 Estructura del Proyecto

Organizada estrictamente por tipo y capas, sin archivos sueltos fuera de los requeridos por la plataforma:

```text
RN1/
├── .gitignore                      # Reglas de exclusión para git (node_modules, .env, .expo, etc.)
├── README.md                       # Documentación principal e instrucciones de arranque
├── docs/                           # Documentación técnica extendida
│   ├── API.md                      # Especificación OpenAPI / REST, ejemplos JSON y códigos HTTP
│   ├── ARQUITECTURA.md             # Diagrama de flujo Mermaid, Atomic Design y paso de props
│   └── TEMAS.md                    # Paletas otoñales, contraste AA y guía de personalización
├── backend/                        # API REST en Node.js + Express + MySQL
│   ├── server.js                   # Punto de entrada del servidor Express
│   ├── package.json                # Dependencias y scripts del backend ("type": "module")
│   ├── .env                        # Variables de entorno locales
│   ├── .env.example                # Plantilla de variables de entorno
│   ├── config/
│   │   └── db.js                   # Pool de conexión mysql2/promise y test de salud
│   ├── routes/
│   │   └── authRoutes.js           # Definición de rutas (/login, /health)
│   ├── controllers/
│   │   └── authController.js       # Lógica de login, hash comparison y health check
│   ├── models/
│   │   └── userModel.js            # Consultas parametrizadas a la tabla usuarios
│   ├── middlewares/
│   │   ├── validateLogin.js        # Validación de campos obligatorios en el body
│   │   └── errorHandler.js         # Capturador global de errores del servidor
│   └── database/
│       ├── schema.sql              # Script SQL (CREATE DATABASE, CREATE TABLE, datos de prueba)
│       └── seed.js                 # Script ejecutable para hashear contraseñas con bcrypt en vivo
└── frontend/                       # Aplicación React Native + Expo + TypeScript
    ├── App.tsx                     # Componente raíz con ThemeProvider, PopupProvider y StatusBar
    ├── package.json                # Dependencias de Expo y React Native
    ├── tsconfig.json               # Configuración estricta de TypeScript
    ├── app.json                    # Manifiesto de Expo
    ├── tailwind.config.js          # Configuración de Tailwind con breakpoints y paleta otoñal
    ├── babel.config.js             # Babel configurado con plugin de NativeWind
    ├── metro.config.js             # Bundler Metro en formato ES Modules
    ├── .env                        # Variable EXPO_PUBLIC_API_URL
    ├── .env.example                # Plantilla de variables para frontend
    ├── assets/                     # Iconos y assets de arranque
    ├── styles/
    │   ├── theme.ts                # Tokens cromáticos otoñales (Light y Dark)
    │   └── global.css              # Reset y estilos globales para la versión Web
    └── scripts/
        ├── types/
        │   └── index.ts            # Interfaces TypeScript de usuarios, API, popups y grilla
        ├── utils/
        │   ├── constants.ts        # URLs de la API, breakpoints de Bootstrap y timeouts
        │   └── validators.ts       # Validadores de formulario (requerido, longitud)
        ├── hooks/
        │   ├── useBreakpoint.ts    # Detección reactiva de resolución (xs, sm, md, lg, xl, xxl)
        │   ├── useTheme.ts         # Acceso al tema activo y alternador de modo
        │   └── usePopup.ts         # Hook global para invocar el modal personalizado
        ├── context/
        │   ├── ThemeContext.tsx    # Contexto de tema con persistencia en AsyncStorage
        │   └── PopupContext.tsx    # Contexto global para el modal emergente
        ├── services/
        │   ├── apiClient.ts        # Cliente HTTP con control de timeout y errores de red
        │   └── authService.ts      # Llamadas a endpoints de autenticación
        ├── navigation/
        │   ├── types.ts            # Tipado estricto de RootStackParamList
        │   └── AppNavigator.tsx    # Pila de navegación con LoginScreen y WelcomeScreen
        ├── components/
        │   ├── atoms/
        │   │   ├── Button.tsx      # Botón accesible con estado de carga y variantes
        │   │   ├── Input.tsx       # Campo de texto accesible con bordes dinámicos
        │   │   ├── Label.tsx       # Tipografía homogénea del sistema
        │   │   ├── Icon.tsx        # Renderizador de iconos Ionicons
        │   │   └── Spinner.tsx     # Indicador de actividad
        │   ├── molecules/
        │   │   ├── FormField.tsx   # Label + Input + Error
        │   │   ├── PasswordField.tsx # Campo con alternador de visibilidad (ojo)
        │   │   ├── ThemeToggle.tsx # Conmutador accesible de tema claro/oscuro
        │   │   └── InfoRow.tsx     # Fila de datos para mostrar atributos de usuario
        │   ├── organisms/
        │   │   ├── Header.tsx      # Barra superior institucional
        │   │   ├── LoginForm.tsx   # Formulario interactivo de inicio de sesión
        │   │   └── UserCard.tsx    # Ficha que recibe props del usuario y las reparte a hijos
        │   ├── grid/
        │   │   ├── Container.tsx   # Contenedor adaptativo según pantalla
        │   │   ├── Row.tsx         # Fila flex para distribución de columnas
        │   │   └── Col.tsx         # Columna de grilla de 12 posiciones tipo Bootstrap
        │   └── feedback/
        │       └── PopupModal.tsx  # Modal emergente sin alert() nativo
        └── screens/
            ├── LoginScreen.tsx     # Pantalla de acceso responsiva (2 columnas en 1920x1080)
            └── WelcomeScreen.tsx   # Pantalla de bienvenida con dashboard multi-columna
```

---

## 📋 Requisitos Previos

1. **Node.js**: Versión 18.x o 20.x LTS instalada ([Descargar Node.js](https://nodejs.org/)).
2. **Servidor MySQL**: Puede utilizarse **XAMPP**, **WAMP**, **MAMP**, **LAMP** o un servicio MySQL standalone local.

---

## 🗄️ Paso 1: Configurar la Base de Datos MySQL

### Opción A (Recomendada): Usando phpMyAdmin
1. Abre tu panel de control de XAMPP / WAMP e inicia el servicio **MySQL** (y Apache si usas phpMyAdmin).
2. Abre tu navegador e ingresa a `http://localhost/phpmyadmin`.
3. Haz clic en la pestaña **Importar** (o en la pestaña **SQL**).
4. Selecciona el archivo `backend/database/schema.sql` y presiona **Importar / Continuar**.
5. ¡Listo! Se creará la base de datos `acceso_usuarios` y la tabla `usuarios` con los usuarios de prueba.

### Opción B: Mediante el script automático `seed.js`
Si prefieres que Node.js cree la base de datos y calcule hashes frescos de `bcrypt` automáticamente:
```bash
cd backend
npm install
npm run seed
```

---

## 👥 Usuarios de Prueba Registrados

| Usuario / Correo | Contraseña | Rol Asignado |
| :--- | :--- | :--- |
| `admin` o `admin@empresa.com` | `admin123` | **Administrador** |
| `juan.perez` o `juan.perez@empresa.com` | `clave456` | **Editor** |
| `maria.lopez` o `maria.lopez@empresa.com` | `secreto789` | **Usuario** |

---

## ⚙️ Paso 2: Instalación y Ejecución del Backend

Abre una terminal en la carpeta `/backend`:

```bash
cd backend
npm install
```

Inicia el servidor en modo desarrollo (con recarga automática):

```bash
npm run dev
```

El servidor quedará escuchando en:
- `http://localhost:3000`
- Verificación de salud: `http://localhost:3000/api/health`

---

## 💻 Paso 3: Instalación y Ejecución del Frontend

Abre otra terminal en la carpeta `/frontend`:

```bash
cd frontend
npm install
```

### Ejecutar en Navegador Web (PC / 1920x1080)
```bash
npm run web
```
O con el comando directo de Expo:
```bash
npx expo start --web
```
Se abrirá automáticamente en tu navegador en `http://localhost:8081`. En resolución completa (1920x1080) observarás el layout a pantalla completa de dos paneles simétricos, sin franjas vacías.

### Ejecutar en Teléfono Móvil Físico (Expo Go)
1. Instala la app **Expo Go** en tu celular desde Google Play o App Store.
2. Abre el archivo `frontend/.env` y reemplaza `localhost` por la dirección IP local de tu PC en la red Wi-Fi (ejemplo: `EXPO_PUBLIC_API_URL=http://192.168.1.45:3000/api`).
3. Ejecuta `npx expo start` y escanea el código QR desde la app Expo Go.

---

## 🎨 Sistema de Modo Claro y Oscuro (Paletas Otoñales)

El conmutador visual `ThemeToggle` está disponible en la cabecera tanto de `LoginScreen` como de `WelcomeScreen`. La preferencia se guarda automáticamente en `AsyncStorage`:

- **Modo Claro:**
  - Fondo Crema: `#F5EBDD`
  - Superficie: `#FBF4E9`
  - Texto Marrón Café: `#4A3426`
  - Primario Terracota: `#B5651D`
  - Secundario Ocre: `#D9A441`
  - Acento Verde Oliva: `#7A8450`
  - Borde: `#E3D2BC`

- **Modo Oscuro:**
  - Fondo Café Profundo: `#2B211B`
  - Superficie: `#3A2D25`
  - Texto Crema Suave: `#EADBC8`
  - Primario Ámbar: `#D98E3F`
  - Secundario Cobre: `#B86B3C`
  - Acento Verde Musgo: `#8E9A5B`
  - Borde: `#52413A`

---

## 🛡️ Solución de Problemas Comunes

1. **Error: "No se pudo conectar al servidor"**:
   - Asegúrate de que el backend esté corriendo en la terminal (`npm run dev` en `/backend`).
   - Verifica en el navegador que `http://localhost:3000/api/health` responda `{ "ok": true }`.
   - Si estás probando desde un teléfono móvil, recuerda configurar la IP local de tu PC en `frontend/.env` en lugar de `localhost`.

2. **Error de conexión a MySQL ("ECONNREFUSED 127.0.0.1:3306")**:
   - Abre el panel de control de XAMPP/WAMP y verifica que el módulo MySQL esté con el botón en verde (puerto 3306).
   - Revisa las credenciales en `backend/.env` (por defecto en XAMPP el usuario es `root` y la contraseña está vacía).

3. **Puerto 3000 ocupado**:
   - Puedes cambiar `PORT=3001` en `backend/.env` y actualizar `EXPO_PUBLIC_API_URL=http://localhost:3001/api` en `frontend/.env`.

---

## ✅ Lista de Verificación de Cumplimiento

- [x] **Cero uso de alert()**: Reemplazado completamente por `PopupModal` con animaciones y controlado globalmente mediante `usePopup()`.
- [x] **Módulos ES en todo el proyecto**: `"type": "module"` en backend y frontend, uso exclusivo de `import/export`.
- [x] **Archivo .gitignore presente**: Excluye `node_modules`, `.env`, builds de Expo, logs y temporales.
- [x] **Modo Claro / Oscuro**: Paletas otoñales relajadas sin blancos ni negros puros, persistencia en `AsyncStorage`.
- [x] **Responsive 1920x1080**: Layout a pantalla completa (dos columnas en login y dashboard de múltiples columnas en bienvenida), adaptativo a móvil.
- [x] **Paso de Props hacia la Bienvenida**: `route.params.user` tipado y transmitido de forma declarativa a `UserCard` e `InfoRow`.
- [x] **Código Atomizado (Atomic Design)**: Estructura clara en `/atoms`, `/molecules`, `/organisms`, `/screens` y `/grid`.
- [x] **Documentación completa**: `README.md`, `docs/API.md`, `docs/ARQUITECTURA.md` y `docs/TEMAS.md`.
