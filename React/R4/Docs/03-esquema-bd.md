# Esquema de Base de Datos

Base de datos relacional en **PostgreSQL** para el portfolio personal. El diseño es **desnormalizado** por simplicidad: cada tabla es independiente, sin Foreign Keys explícitas entre sí. Esto permite un CRUD sencillo y una evolución gradual sin necesidad de joins complejos en la primera etapa.

---

## Diagrama Textual

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│     skills       │      │    projects      │      │   experiences    │
│──────────────────│      │──────────────────│      │──────────────────│
│ id (PK)          │      │ id (PK)          │      │ id (PK)          │
│ name             │      │ title            │      │ company          │
│ level            │      │ description      │      │ role             │
│ category         │      │ repo_url         │      │ start_date       │
│ icon_name        │      │ demo_url         │      │ end_date         │
│ created_at       │      │ image_url        │      │ location         │
└──────────────────┘      │ tags (TEXT[])    │      │ description      │
                           │ featured         │      │ created_at       │
                           │ created_at       │      └──────────────────┘
                           └──────────────────┘
                                     │
                                     │  (independientes, sin FK)
                                     ▼
┌──────────────────┐      ┌──────────────────┐
│   achievements   │      │    messages      │
│──────────────────│      │──────────────────│
│ id (PK)          │      │ id (PK)          │
│ title            │      │ name             │
│ issuer           │      │ email            │
│ date_earned      │      │ body             │
│ description      │      │ read             │
│ certificate_url  │      │ created_at       │
│ created_at       │      └──────────────────┘
└──────────────────┘
```

> Nota: en esta versión inicial no hay flechas de FK porque las entidades no tienen relaciones forzadas. Cada tabla se consume de forma aislada desde la API (`/api/skills`, `/api/projects`, etc.).

---

## 1. Tabla `skills`

Habilidades técnicas y blandas que se muestran en la sección "Skills".

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `SERIAL` | **PK**, `NOT NULL` | Identificador único autoincremental. |
| `name` | `VARCHAR(100)` | `NOT NULL` | Nombre de la habilidad (ej: "React", "Trabajo en equipo"). |
| `level` | `INTEGER` | `NOT NULL DEFAULT 0`, `CHECK (level BETWEEN 0 AND 100)` | Nivel de dominio (0–100) para renderizar la barra de progreso. |
| `category` | `VARCHAR(50)` | `NOT NULL` | Agrupador (ej: "Frontend", "Backend", "Soft Skills"). |
| `icon_name` | `VARCHAR(100)` | nullable | Identificador del ícono asociado (coincide con el componente `Icon`). |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Fecha/hora de alta. |

**Índices:**
- `idx_skills_category` sobre `category` → acelera los `WHERE category = 'X'`.

---

## 2. Tabla `projects`

Proyectos destacados que se muestran en la galería del portfolio.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `SERIAL` | **PK**, `NOT NULL` | Identificador único autoincremental. |
| `title` | `VARCHAR(200)` | `NOT NULL` | Título del proyecto. |
| `description` | `TEXT` | `NOT NULL` | Descripción detallada (párrafo largo). |
| `repo_url` | `VARCHAR(500)` | nullable | Link al repositorio Git (GitHub/GitLab/Bitbucket). |
| `demo_url` | `VARCHAR(500)` | nullable | Link a la demo en vivo (Vercel/Netlify/Heroku). |
| `image_url` | `VARCHAR(500)` | nullable | URL o path a la imagen thumbnail/captura. |
| `tags` | `TEXT[]` | `NOT NULL DEFAULT '{}'` | Arreglo de PostgreSQL con los tags de tecnología. |
| `featured` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | `TRUE` si el proyecto es "destacado" y aparece en la sección principal. |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Fecha/hora de alta. |

**Índices:**
- `idx_projects_featured` sobre `featured` → acelera `WHERE featured = TRUE`.

---

## 3. Tabla `experiences`

Experiencia laboral para la sección "Trayectoria / Línea de tiempo".

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `SERIAL` | **PK**, `NOT NULL` | Identificador único autoincremental. |
| `company` | `VARCHAR(200)` | `NOT NULL` | Nombre de la empresa. |
| `role` | `VARCHAR(200)` | `NOT NULL` | Cargo/rol desempeñado. |
| `start_date` | `DATE` | `NOT NULL` | Fecha de ingreso. |
| `end_date` | `DATE` | nullable | Fecha de egreso. `NULL` indica "trabajo actual". |
| `location` | `VARCHAR(200)` | nullable | Ciudad / país / remoto. |
| `description` | `TEXT` | nullable | Descripción de tareas y logros (bullet points o párrafo). |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Fecha/hora de alta. |

**Índices:**
- `idx_experiences_start_date` sobre `start_date DESC` → acelera el ordenamiento por experiencia más reciente.

---

## 4. Tabla `achievements`

Certificaciones, cursos y logros.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `SERIAL` | **PK**, `NOT NULL` | Identificador único autoincremental. |
| `title` | `VARCHAR(200)` | `NOT NULL` | Nombre del certificado/logro. |
| `issuer` | `VARCHAR(200)` | `NOT NULL` | Entidad emisora (ej: "Coursera", "Google", "Universidad X"). |
| `date_earned` | `DATE` | `NOT NULL` | Fecha en que se obtuvo. |
| `description` | `TEXT` | nullable | Detalle del programa, skills aprendidas, etc. |
| `certificate_url` | `VARCHAR(500)` | nullable | Link al certificado verificable online. |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Fecha/hora de alta. |

**Índices:**
- `idx_achievements_date_earned` sobre `date_earned DESC` → ordena del más reciente al más viejo.

---

## 5. Tabla `messages`

Mensajes enviados por los visitantes a través del formulario de contacto.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `SERIAL` | **PK**, `NOT NULL` | Identificador único autoincremental. |
| `name` | `VARCHAR(200)` | `NOT NULL` | Nombre completo de la persona. |
| `email` | `VARCHAR(200)` | `NOT NULL` | Dirección de correo de contacto. |
| `body` | `TEXT` | `NOT NULL` | Contenido del mensaje. |
| `read` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Bandera de "leído" para un futuro panel admin. |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Fecha/hora en que se recibió el mensaje. |

**Índices:**
- `idx_messages_read` sobre `read` → permite listar rápido los mensajes `read = FALSE`.

---

## Convenciones

- **PK:** Todas las tablas usan `SERIAL` (PostgreSQL) para `id` autoincremental.
- **Timestamps:** Todas tienen `created_at` con `DEFAULT NOW()` para auditoría.
- **Constraints CHECK:** Solo donde tiene sentido (ej: `skills.level` 0–100).
- **Nullabilidad:** Las columnas opcionales se declaran `NULL`; las obligatorias `NOT NULL` (con `DEFAULT` cuando corresponde).
- **Sin FK por ahora:** En una segunda etapa se pueden agregar tablas de join (ej: `projects_skills`) si se necesitan relaciones N:N.
