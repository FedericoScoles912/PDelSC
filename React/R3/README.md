# user-auth-system — Sistema de Autenticación Dual (React Router / useState)

Aplicación educativa y plantilla full-stack de autenticación y gestión de usuarios (login, registro, perfil, logout) conectada a una base de datos **MySQL 8.0** (compatible con MySQL Workbench 8.0) mediante una API REST en **Node.js + Express**.

El proyecto implementa **dos sistemas frontend independientes** dentro de la misma base de código que consumen la misma API y base de datos:

- **Sistema A — "router-system"** (`/src/RouterSystem`): navegación gestionada con **React Router v6** (rutas: `/login`, `/register`, `/profile`, `/dashboard` y componente `<ProtectedRoute />`).
- **Sistema B — "state-system"** (`/src/StateSystem`): navegación gestionada sin React Router, controlada exclusivamente mediante **`useState`** condicional y `<StateProtectedRoute />`.

---

## 1. Stack Tecnológico

| Capa | Tecnología | Descripción |
|---|---|---|
| **Frontend** | React 18 + Vite | SPA moderna sin Create React App |
| **Estilos** | TailwindCSS + Bootstrap 5 | Bootstrap solo para utilidades responsive (grid/breakpoints) y TailwindCSS para estilos visuales con paleta otoñal |
| **Navegación A** | React Router v6 | Enrutamiento basado en URLs y soporte de historial del navegador |
| **Navegación B** | `useState` puro | Renderizado condicional sin dependencias externas de enrutamiento |
| **Formularios** | React Hook Form (`useForm`) | Validación y control en todos los formularios (Login, Registro, Perfil) |
| **Estado Global** | Context API | `AuthContext` (sesión, token, usuario) y `ThemeContext` (tema claro/oscuro) |
| **Persistencia** | `localStorage` | Persistencia del JWT y tema entre recargas |
| **Cliente HTTP** | Axios | Cliente configurado con interceptores para inyectar token `Bearer` |
| **Notificaciones** | Modal propio (`<ModalAlert />`) | Sin uso de `alert()`, `confirm()` ni `prompt()` nativos |
| **Backend** | Node.js + Express 4 | API REST modular en `server.js` |
| **Base de Datos** | MySQL 8.0 | Driver `mysql2/promise` con `Pool` y prepared statements |
| **GUI BBDD** | MySQL Workbench 8.0 | Herramienta de gestión gráfica y administración |
| **Seguridad** | bcrypt + JWT | 10 rounds de salt para contraseñas; tokens JWT firmados |

---

## 2. Estructura de Carpetas

Organizada estrictamente por **tipo de archivo** (en inglés y mayúscula inicial):

```text
user-auth-system/
├── server.js                          # API REST con Express y conexión a MySQL (raíz)
├── package.json                       # Scripts y dependencias unificadas (raíz)
├── vite.config.js                     # Configuración de Vite
├── tailwind.config.js                 # Configuración de TailwindCSS con paleta otoñal
├── postcss.config.js                  # Configuración PostCSS
├── index.html                         # Entrypoint HTML con viewport y Google Fonts
├── .env.example                       # Ejemplo de variables de entorno
├── .env                               # Variables locales de entorno (ignorado en git)
├── .gitignore                         # Reglas de exclusión (node_modules, .env, dist, logs)
│
├── Database/
│   ├── schema.sql                     # DDL de MySQL: base auth_system, tabla users e índices
│   └── initDb.js                      # Script para inicializar/migrar la base de datos MySQL
│
└── src/
    ├── main.jsx                       # Montaje de React con ThemeProvider y AuthProvider
    ├── App.jsx                        # Conmutador entre Sistema A (Router) y Sistema B (State)
    │
    ├── Scripts/                       # Lógica JavaScript desacoplada
    │   ├── context/
    │   │   ├── AuthContext.jsx        # Estado global de usuario, token y métodos de sesión
    │   │   └── ThemeContext.jsx       # Gestión de tema claro/oscuro y persistencia
    │   ├── hooks/
    │   │   ├── useAuth.js             # Hook para acceder a AuthContext
    │   │   ├── useTheme.js            # Hook para acceder a ThemeContext
    │   │   └── useModal.js            # Hook para disparar modales/toasts sin alert nativo
    │   ├── services/
    │   │   ├── api.js                 # Cliente Axios con interceptor Bearer
    │   │   └── authService.js         # Endpoints: register, login, profile, logout
    │   └── utils/
    │       ├── constants.js           # Claves de localStorage y rutas
    │       └── validators.js          # Reglas de validación para React Hook Form
    │
    ├── Styles/
    │   ├── index.css                  # Bootstrap grid/utilities + directivas Tailwind
    │   └── theme.css                  # Variables CSS para la paleta otoñal (light/dark)
    │
    ├── Components/                    # Componentes atómicos reutilizables
    │   ├── Button.jsx                 # Botón con variantes primaria, secundaria, olive, peligro
    │   ├── Input.jsx                  # Input forwardRef para React Hook Form con errores
    │   ├── Card.jsx                   # Contenedor adaptable a 1920x1080 y dispositivos móviles
    │   ├── ModalAlert.jsx             # Modal/Popup propio accesible (reemplaza alert/confirm)
    │   ├── ThemeToggle.jsx            # Interruptor de modo claro/oscuro otoñal
    │   ├── FormWrapper.jsx            # Envoltorio responsivo para formularios
    │   └── Navbar.jsx                 # Barra de navegación con badge de sistema activo
    │
    ├── Views/                         # Pantallas completas
    │   ├── LoginView.jsx              # Formulario de inicio de sesión con useForm
    │   ├── RegisterView.jsx           # Formulario de registro con useForm
    │   ├── ProfileView.jsx            # Formulario de edición de perfil con useForm
    │   └── DashboardView.jsx          # Panel principal con datos de la BBDD
    │
    ├── RouterSystem/                  # Sistema A: React Router v6
    │   ├── AppRouter.jsx              # BrowserRouter, Routes, Route y layout
    │   └── ProtectedRoute.jsx         # Guard de protección con <Navigate to="/login" />
    │
    ├── StateSystem/                   # Sistema B: useState puro
    │   ├── StateApp.jsx               # Navegación condicional por estado (screenKey)
    │   └── StateProtectedRoute.jsx    # Guard condicional que fuerza LoginView sin sesión
    │
    └── Assets/                        # Recursos gráficos estáticos
```

---

## 3. Base de Datos SQL (MySQL 8.0)

El esquema se encuentra en [`Database/schema.sql`](Database/schema.sql) y crea la base de datos `auth_system` y la tabla `users`:

```sql
CREATE DATABASE IF NOT EXISTS `auth_system`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `auth_system`;

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id`              CHAR(36)        NOT NULL PRIMARY KEY,
  `name`            VARCHAR(100)    NOT NULL,
  `email`           VARCHAR(255)    NOT NULL,
  `password`        VARCHAR(255)    NOT NULL,
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. Endpoints de la API REST (`server.js`)

Todas las consultas utilizan **prepared statements parametrizados (`?`)** contra MySQL, previniendo inyección SQL.

| Método | Endpoint | Protegido | Descripción |
|---|---|---|---|
| `POST` | `/api/register` | No | Registra un nuevo usuario (`name`, `email`, `password`) hasheando la clave con bcrypt |
| `POST` | `/api/login` | No | Compara contraseñas y emite un token JWT firmado |
| `GET` | `/api/profile` | Sí (Bearer) | Obtiene los datos del usuario autenticado |
| `PUT` | `/api/profile` | Sí (Bearer) | Actualiza `name`, `email` y opcionalmente `password` |
| `POST` | `/api/logout` | No | Cierre de sesión formal |
| `GET` | `/api/health` | No | Chequeo de salud y conexión con MySQL 8.0 |

---

## 5. Persistencia y Protección de Rutas (A vs B)

### Persistencia de Sesión
1. Tras un login o registro exitoso, el token JWT se almacena en `localStorage.setItem('user_auth_token', token)`.
2. Al recargar la página, un `useEffect` en `AuthContext` consulta automáticamente `GET /api/profile` usando el token guardado.
3. Si el token es válido, se restaura el objeto `user` en el estado global. Si expiró o es inválido, se limpia el almacenamiento y se cierra la sesión.

### Protección de Rutas
- **Sistema A (`/src/RouterSystem`)**:
  - Implementa el componente `<ProtectedRoute>`:
  ```jsx
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
  ```
- **Sistema B (`/src/StateSystem`)**:
  - Implementa el componente `<StateProtectedRoute>`:
  ```jsx
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={...} />;
  }
  return children;
  ```
  - La pantalla activa se controla mediante `useState(currentScreen)`. Si un usuario intenta acceder a `dashboard` o `profile` sin sesión activa, el estado fuerza de inmediato la vista `login`.

---

## 6. Diseño UI y Paleta Otoñal (Modo Claro y Oscuro)

El diseño está concebido para aprovechar al máximo pantallas **Full HD (1920x1080)** mediante tarjetas amplias, espaciado generoso y rejilla responsiva de Bootstrap (`row`, `col-12 col-md-6 col-xl-3`), combinada con TailwindCSS:

- **Modo Claro**:
  - Fondo: Beige cálido (`#FAF8F5`).
  - Tarjetas: Blanco puro con borde suave (`#E8DFD5`).
  - Color Primario: Terracota cálido (`#C85A32`).
  - Color Secundario: Mostaza otoñal (`#D49B27`).
  - Acentos: Verde oliva (`#606C38`) y marrón cálido (`#5C3A21`).
- **Modo Oscuro**:
  - Fondo: Tono café espresso cálido (`#1E1916`), evitando negro puro y grises fríos.
  - Tarjetas: Superficie otoñal profunda (`#29221D`).
  - Color Primario: Terracota suave (`#E07A5F`).
  - Color Secundario: Mostaza dorado (`#E9C46A`).
  - Textos: Tono perla otoñal cálido (`#F7F3EE`).

El tema se conmuta mediante `<ThemeToggle />` y se persiste en `localStorage` bajo la clave `user_auth_theme`.

---

## 7. Instrucciones de Instalación y Puesta en Marcha

### Requisitos Previos
- Node.js ≥ 18
- MySQL 8.0 Server (local o mediante MySQL Workbench 8.0 / XAMPP / WAMP)

### Paso 1: Clonar e instalar dependencias
```bash
npm install
```

### Paso 2: Configurar variables de entorno
Copia el archivo de ejemplo `.env.example` a `.env`:
```bash
cp .env.example .env
```
Edita `.env` con las credenciales de tu MySQL Workbench (por defecto usuario `root`):
```env
PORT=4000
NODE_ENV=development

# Conexión MySQL 8.0
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=auth_system

# Clave secreta JWT
JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRES_IN=1d
BCRYPT_ROUNDS=10

# URLs de conexión
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:4000/api
```

### Paso 3: Inicializar la Base de Datos
Puedes crear la base de datos automáticamente ejecutando el script integrado:
```bash
npm run db:init
```

*(O bien abrís MySQL Workbench 8.0 y ejecutás directamente el contenido de `Database/schema.sql`)*.

### Paso 4: Ejecutar el Proyecto
Para iniciar simultáneamente el Backend (Express en `:4000`) y el Frontend (Vite en `:5173`):
```bash
npm run dev
```

*Alternativamente, puedes ejecutarlos en terminales separadas:*
```bash
# Terminal 1 — Backend
npm run server:dev

# Terminal 2 — Frontend
npm run client:dev
```

Abre tu navegador en `http://localhost:5173`. Puedes alternar en tiempo real entre el **Sistema A (React Router)** y el **Sistema B (useState)** desde el botón situado en la barra de navegación superior.
