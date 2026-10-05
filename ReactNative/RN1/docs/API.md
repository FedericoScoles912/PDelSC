# Documentación de la API REST - Control de Acceso

La API REST está desarrollada con **Node.js + Express** utilizando **Módulos ES (`import/export`)**, consultas parametrizadas con `mysql2/promise` para prevenir inyección SQL y cifrado de contraseñas mediante **`bcrypt`**.

---

## 1. Configuración Base

- **URL Base Local:** `http://localhost:3000/api`
- **Formato de Petición:** `application/json`
- **Formato de Respuesta:** `application/json`

---

## 2. Endpoints

### 2.1. Iniciar Sesión

Autentica a un usuario comparando su contraseña con el hash seguro `bcrypt` guardado en la base de datos MySQL. Nunca devuelve el hash de la contraseña ni datos sensibles.

- **Método:** `POST`
- **Ruta:** `/auth/login`
- **Headers:**
  ```http
  Content-Type: application/json
  Accept: application/json
  ```

#### Cuerpo de la Petición (Request Body)

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `usuario` | `string` | **Sí** | Nombre de usuario o dirección de correo electrónico. |
| `password` | `string` | **Sí** | Contraseña del usuario en texto plano. |

```json
{
  "usuario": "admin",
  "password": "admin123"
}
```

*O usando correo electrónico:*
```json
{
  "usuario": "admin@empresa.com",
  "password": "admin123"
}
```

#### Respuestas (Responses)

##### 🟢 200 OK — Credenciales Válidas
Devuelve la bandera `ok: true` y el objeto con los datos del usuario autenticado:

```json
{
  "ok": true,
  "usuario": {
    "id": 1,
    "nombre": "Federico Scoles",
    "correo": "admin@empresa.com",
    "rol": "Administrador"
  }
}
```

##### 🟡 400 Bad Request — Campos Faltantes o Vacíos
Se produce si uno o ambos campos requeridos no fueron provistos:

```json
{
  "ok": false,
  "mensaje": "El nombre de usuario o correo electrónico es obligatorio."
}
```

##### 🔴 401 Unauthorized — Credenciales Inválidas
Se produce cuando el usuario no existe en la base de datos o la contraseña no coincide con el hash:

```json
{
  "ok": false,
  "mensaje": "Credenciales inválidas"
}
```

##### 🔴 500 Internal Server Error — Error en el Servidor
Se produce en caso de fallo inesperado o corte de conexión con el motor de base de datos MySQL:

```json
{
  "ok": false,
  "mensaje": "Error interno del servidor"
}
```

---

### 2.2. Health Check (Verificación de Estado)

Endpoint auxiliar para comprobar la disponibilidad y conectividad del servicio backend.

- **Método:** `GET`
- **Ruta:** `/auth/health` o `/api/health`

#### Respuesta (200 OK)

```json
{
  "ok": true,
  "status": "UP",
  "servicio": "API de Acceso de Usuarios",
  "version": "1.0.0",
  "timestamp": "2026-10-05T12:00:00.000Z"
}
```

---

## 3. Códigos de Estado HTTP Utilizados

| Código | Significado | Escenario |
| :---: | :--- | :--- |
| **200** | OK | Login exitoso o servidor saludable en Health check. |
| **400** | Bad Request | Parámetros obligatorios ausentes en el cuerpo JSON. |
| **401** | Unauthorized | Usuario no encontrado o contraseña incorrecta. |
| **408** | Request Timeout | El cliente agotó el tiempo máximo de espera sin respuesta del servidor. |
| **500** | Internal Server Error | Excepción no controlada en el backend o caída de MySQL. |
