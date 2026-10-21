# Diagramas — Sistema de Control de Stock (Retenes EMIC)

Diagramas de referencia del proyecto: **modelo entidad-relación**, **arquitectura de capas** y
**flujo de autenticación**. Se escriben en [Mermaid](https://mermaid.js.org/) y se renderizan
automáticamente en visores compatibles (GitHub, VS Code con extensión Mermaid, etc.).

---

## 1. Arquitectura general

Vista de tres capas: **frontend multiplataforma** (Expo), **backend** (API REST por capas) y
**base de datos** (MySQL).

```mermaid
flowchart TD
    subgraph Cliente["Frontend — React Native + Expo (Android / Web)"]
        UI["Screens + Navigation<br/>(React Navigation 7)"]
        REDUX["Redux Toolkit + RTK Query<br/>(capa de datos y sesión)"]
        COMP["Components<br/>(Atomic Design)"]
        UI --> REDUX
        UI --> COMP
    end

    subgraph Servidor["Backend — Node.js + Express (ES Modules)"]
        ROUTES["Routes /api/v1"]
        MW["Middlewares<br/>auth · roles · validate · rate limit · error"]
        CTRL["Controllers"]
        SVC["Services<br/>(lógica de negocio)"]
        REPO["Repositories<br/>(acceso a datos)"]
        ROUTES --> MW --> CTRL --> SVC --> REPO
    end

    DB[("MySQL / MariaDB<br/>13 tablas · 5 vistas<br/>procedimientos y triggers")]

    REDUX -- "HTTP JSON + JWT" --> ROUTES
    REPO -- "SQL (mysql2/promise)" --> DB

    EXCEL["Excel: Lista de Precios EMIC<br/>(hoja 'Por Medidas')"] -. "importación" .-> SVC
```

---

## 2. Modelo entidad-relación

### 2.1 Diagrama ER

```mermaid
erDiagram
    roles ||--o{ usuarios : "rol_id"
    usuarios ||--o{ proveedores_oauth : "usuario_id"
    usuarios ||--o{ refresh_tokens : "usuario_id"

    categorias ||--o{ productos : "categoria_id"
    productos ||--o{ equivalencias : "producto_id"
    productos ||--|| stock : "producto_id"
    productos ||--o{ movimientos_stock : "producto_id"
    productos ||--o{ historial_precios : "producto_id"
    productos ||--o{ alertas_stock : "producto_id"

    usuarios ||--o{ movimientos_stock : "usuario_id"
    usuarios ||--o{ historial_precios : "usuario_id"
    usuarios ||--o{ auditoria : "usuario_id"

    roles {
        INT id PK
        VARCHAR nombre UK
        VARCHAR descripcion
        JSON permisos
        TIMESTAMP creado_en
    }
    usuarios {
        INT id PK
        VARCHAR nombre
        VARCHAR apellido
        VARCHAR email UK
        VARCHAR password_hash
        INT rol_id FK
        TINYINT activo
        TINYINT email_verificado
        DATETIME ultimo_login
    }
    proveedores_oauth {
        INT id PK
        INT usuario_id FK
        ENUM proveedor
        VARCHAR provider_user_id
        VARCHAR email_proveedor
    }
    refresh_tokens {
        INT id PK
        INT usuario_id FK
        CHAR token_hash UK
        DATETIME expira_en
        TINYINT revocado
        INT reemplazado_por_id
        VARCHAR ip
        VARCHAR user_agent
    }
    categorias {
        INT id PK
        VARCHAR nombre UK
        VARCHAR slug UK
        VARCHAR descripcion
        INT orden
        TINYINT activo
    }
    productos {
        INT id PK
        VARCHAR codigo UK
        INT categoria_id FK
        VARCHAR lanzamiento
        VARCHAR eje_texto
        DECIMAL eje_valor
        VARCHAR aloj_texto
        DECIMAL aloj_valor
        VARCHAR alt_texto
        DECIMAL alt_valor
        VARCHAR giro
        INT uxb
        TEXT observaciones
        DECIMAL precio_lista
        TINYINT proximo_ingreso
        INT stock_minimo
        TINYINT activo
    }
    equivalencias {
        INT id PK
        INT producto_id FK
        ENUM tipo
        VARCHAR codigo
    }
    stock {
        INT producto_id PK
        INT cantidad
        TIMESTAMP actualizado_en
    }
    movimientos_stock {
        INT id PK
        INT producto_id FK
        ENUM tipo
        INT cantidad
        INT stock_anterior
        INT stock_nuevo
        VARCHAR motivo
        VARCHAR referencia
        INT usuario_id FK
        TIMESTAMP creado_en
    }
    historial_precios {
        INT id PK
        INT producto_id FK
        DECIMAL precio_anterior
        DECIMAL precio_nuevo
        ENUM origen
        INT usuario_id FK
        TIMESTAMP creado_en
    }
    alertas_stock {
        INT id PK
        INT producto_id FK
        INT stock_valor
        INT minimo
        TINYINT resuelta
        DATETIME resuelta_en
    }
    auditoria {
        INT id PK
        INT usuario_id FK
        VARCHAR accion
        VARCHAR entidad
        INT entidad_id
        JSON datos_antes
        JSON datos_despues
        VARCHAR ip
        TIMESTAMP creado_en
    }
    configuracion {
        VARCHAR clave PK
        TEXT valor
        VARCHAR descripcion
    }
```

### 2.2 Resumen de tablas

| Tabla | Descripción |
|-------|-------------|
| `roles` | Roles del sistema y su lista de permisos (JSON). |
| `usuarios` | Usuarios con credenciales (bcrypt) y rol. |
| `proveedores_oauth` | Identidades de Google / Facebook / GitHub vinculadas a un usuario. |
| `refresh_tokens` | Refresh tokens hasheados (rotación y revocación). |
| `categorias` | Categorías / secciones del catálogo. |
| `productos` | Catálogo: código, medidas (eje/aloj/alt), giro, precio, stock mínimo. |
| `equivalencias` | Códigos equivalentes OEM / A / S por producto. |
| `stock` | Existencias actuales (1 fila por producto). |
| `movimientos_stock` | Historial de ingresos, egresos y ajustes. |
| `historial_precios` | Cambios de precio con origen y usuario. |
| `alertas_stock` | Alertas generadas por stock bajo el mínimo. |
| `auditoria` | Bitácora de operaciones (quién, qué, cuándo). |
| `configuracion` | Parámetros generales (clave-valor). |

### 2.3 Vistas

| Vista | Uso |
|-------|-----|
| `v_stock_actual` | Producto + categoría + stock + valorización (base de reportes). |
| `v_productos_stock_bajo` | Productos activos con stock ≤ mínimo. |
| `v_valor_stock` | KPIs globales de valorización. |
| `v_ultimos_movimientos` | Movimientos legibles (código de producto y usuario). |
| `v_resumen_por_categoria` | Productos, unidades y valor por categoría. |

### 2.4 Rutinas

| Objeto | Tipo | Descripción |
|--------|------|-------------|
| `sp_registrar_movimiento` | Procedure | Registra un movimiento de stock de forma transaccional. |
| `tr_alertas_stock` | Trigger | Genera una alerta cuando el stock cae por debajo del mínimo. |

---

## 3. Flujo de autenticación (JWT + refresh rotativo)

```mermaid
sequenceDiagram
    participant U as Usuario (App)
    participant A as API /auth
    participant DB as MySQL

    U->>A: POST /auth/login (email + password)
    A->>DB: Buscar usuario + verificar bcrypt
    DB-->>A: Usuario válido
    A->>DB: Guardar hash del refresh token
    A-->>U: { usuario, accessToken (15m), refreshToken (7d) }

    Note over U: La app guarda la sesión de forma segura<br/>(expo-secure-store / localStorage)

    U->>A: GET /productos (Bearer accessToken)
    A-->>U: 200 OK

    Note over U,A: Cuando el accessToken expira…
    U->>A: POST /auth/refresh (refreshToken)
    A->>DB: Validar + revocar el token usado
    A->>DB: Guardar nuevo refresh (encadenado)
    A-->>U: Nuevo { accessToken, refreshToken }

    Note over U,A: Si un refresh ya usado se reintenta…
    A-->>U: 401 (reutilización detectada → sesión cerrada)
```

---

## 4. Flujo de un movimiento de stock

```mermaid
sequenceDiagram
    participant U as Usuario
    participant A as API /movimientos
    participant DB as MySQL

    U->>A: POST /movimientos { productoId, tipo, cantidad }
    A->>DB: BEGIN
    A->>DB: SELECT cantidad FROM stock FOR UPDATE
    DB-->>A: stock_anterior
    A->>DB: Calcular stock_nuevo según tipo
    A->>DB: UPDATE stock SET cantidad = stock_nuevo
    A->>DB: INSERT movimientos_stock
    A->>DB: INSERT auditoría
    A->>DB: COMMIT
    DB-->>A: (trigger tr_alertas_stock si stock ≤ mínimo)
    A-->>U: { stockAnterior, stockNuevo }
```
