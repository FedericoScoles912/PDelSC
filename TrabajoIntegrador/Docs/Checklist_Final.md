# Checklist final de requisitos

Revisión del proyecto **Sistema de Control de Stock — Retenes EMIC** contra el brief (`# ROL`).
Última actualización: 19/10/2026.

**Leyenda:** ✅ Cumplido · ⚠️ Cumplido con observación · ⛔ Pendiente

---

## 1. Objetivo y contexto de datos

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| App Android (APK) + navegador PC 1920×1080 con Expo | ✅ | `client/` (Expo SDK 58) + [Guia_APK.md](Guia_APK.md) |
| Modelo de datos basado en el Excel EMIC ("Por Medidas") | ✅ | [excelParser.js](../BACKEND/import/excelParser.js), 365 productos importados |
| Medidas EJE/ALOJ/ALT: texto original + valor DECIMAL | ✅ | `productos.eje_texto/eje_valor`, `aloj_*`, `alt_*` |
| GIRO, UxB, OBSERVACIONES, equivalencias OEM/A/S | ✅ | `productos`, `equivalencias (tipo: OEM/A/S)` |
| DISP. BS.AS. / PRÓX. EMB. | ✅ | `stock`, `productos.proximo_ingreso` |
| "PRÓXIMO INGRESO" → precio NULL + `proximo_ingreso = 1` | ✅ | `productos.precio_lista NULL` + `proximo_ingreso` |
| Categorías detectadas por filas-encabezado | ✅ | 5 categorías en `categorias` |
| Script de importación con limpieza y log de descartes | ✅ | [importarExcel.js](../BACKEND/import/importarExcel.js), `npm run import:excel` (`--dry-run` disponible) |

## 2. Stack obligatorio

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Frontend React Native + Expo (`npx expo start` / Expo Go) | ✅ | `client/package.json`, `client/app.json` |
| TailwindCSS vía NativeWind | ✅ | `client/tailwind.config.js`, `nativewind` 4.2.7 |
| Backend Node.js + Express en `server.js` (raíz) | ✅ | [server.js](../server.js) |
| MySQL administrable desde Workbench | ✅ | `SQL/01…06` ejecutables en orden |
| ES Modules en todo el código + `"type": "module"` | ✅ | `package.json` raíz y `client/package.json` |
| Git: `.gitignore` completo + `.env.example` | ✅ | [.gitignore](../.gitignore), [.env.example](../.env.example), `client/.gitignore`, `client/.env.example` |

## 3. Requisitos funcionales

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| 1. Registro/login email+contraseña con bcrypt | ✅ | `BACKEND/services/authService.js`, `utils/password.js` (verificado en runtime) |
| 1. 3 proveedores sociales (Google, Facebook, GitHub) | ⚠️ | `BACKEND/services/oauthService.js` + `proveedores_oauth`. Código listo; requiere client ID/secret reales |
| 1. Documentación de client ID/secret y redirect URIs para Expo Go | ✅ | [Guia_de_Instalacion.md](Guia_de_Instalacion.md) §9 |
| 2. Rol Administrador (usuarios, roles, ABM, config, reportes, auditoría) | ✅ | `routes/usuarios|roles|productos|categorias|configuracion|auditoria` |
| 2. Rol Encargado de Depósito (ABM productos, movimientos, reportes; sin usuarios) | ✅ | `roleRequired(ADMIN, DEPOSITO)`; `/usuarios` sólo Admin |
| 2. Rol Vendedor (sólo lectura + egreso por venta) | ✅ | `routes/movimientos` permite POST a Vendedor; `routes/productos` lectura |
| 2. UI oculta pantallas/botones según rol | ✅ | `client/Navigation/navItems.js`, `Utils/roles.js` |
| 2. Backend protege cada endpoint con middleware de roles | ✅ | `middlewares/auth.js` + `middlewares/roles.js` (RBAC verificado: 403 en runtime) |
| 3. Dashboard con KPIs y **gráficos** | ✅ | `DashboardScreen.js` + `BarChart.js` (10 KPIs + gráfico por categoría) |
| 3. Productos ABML: listado paginado + filtros categoría/giro/línea | ✅ | `productoRepo.js`, `productoSchemas.js` |
| 3. Búsqueda avanzada por medidas con tolerancia, código, OEM y texto | ✅ | `productos.eje/aloj/alt` + `FULLTEXT(observaciones, codigo)` (probado: `eje=30&tolerancia=0.5` → 12) |
| 3. Movimientos ingreso/egreso/ajuste con motivo, usuario y fecha | ✅ | `movimientoService.js` |
| 3. Impacto automático de stock con transacciones SQL | ✅ | `withTransaction` + `SELECT … FOR UPDATE`, `sp_registrar_movimiento` (verificado en runtime) |
| 3. Alertas de stock mínimo configurable por producto | ✅ | `productos.stock_minimo`, tabla `alertas_stock`, trigger `tr_alertas_stock` |
| 3. Gestión de precios con historial | ✅ | `historial_precios`, `precioService.js`, `PreciosScreen.js` |
| 3. Re-importar lista de precios (sólo Admin) con preview | ✅ | `routes/precios.js` (`/importar/preview`, `/importar/confirmar` sólo Admin) |
| 3. Categorías, usuarios y auditoría (quién/cuándo) | ✅ | `auditoria` + `auditoriaService.js` + `AuditoriaScreen.js` |
| 3. Reportes exportables | ⚠️ | `/reportes/stock/export`, `/movimientos/export` en CSV (UTF-8 con BOM y `;`, compatible con Excel) |
| 4. Validaciones en frontend y backend | ✅ | Zod (`BACKEND/validators/`) + validación en formularios del cliente |
| 4. Manejo de errores, 401/403/404/422/500, reintento con refresh | ✅ | `middlewares/error.js`, `client/Services/http.js` (reintento automático) |

## 4. Requisitos técnicos de frontend

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Navegación (React Navigation) + sidebar fija en PC | ✅ | `client/Navigation/*`, `AppShell.js` (sidebar ≥1024px, drawer en móvil) |
| Estado global con Redux Toolkit (elegido y justificado) | ✅ | `client/Store/*` (RTK + RTK Query); justificación en README |
| Sesión persistente y restaurada al reabrir | ✅ | `expo-secure-store` (nativo) + `localStorage` (web) en `Services/storage.js` |
| Responsive aprovechando 1920×1080 | ✅ | `Utils/responsive.js`, layouts multicolumna, tablas amplias |
| Grilla Bootstrap (12 col., breakpoints) en convivencia con Tailwind | ✅ | `Components/atoms/Grid.js` (`Container`/`Row`/`Col`) + sección "Sistema de estilos y grilla" del README |
| Sin `alert()`/`Alert.alert`; sistema de pop-ups propio | ✅ | `FeedbackProvider.js` + `ModalPopup.js` (`popup.success/error/warning/info/confirm`) |
| Modo claro/oscuro conmutable, persistente y con preferencia del sistema | ✅ | `themeSlice.js`, `ThemeProvider.js`, `toggleDark` en `TopBar.js` |
| Paleta cálida otoñal en tokens (claro/oscuro) | ✅ | `client/Styles/theme.js`, `tailwind.config.js` |
| Accesibilidad: contraste, táctiles ≥44px, labels en inputs | ✅ | `Button.js` (alto ≥44px en `md`/`lg`), `Input.js`/`FormField.js` con label |

## 5. Requisitos técnicos de backend

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| API REST Express versionada `/api/v1` | ✅ | `server.js`, `BACKEND/routes/index.js` |
| Endpoints: auth, usuarios, roles, categorías, productos, movimientos, precios, reportes, importación, auditoría, dashboard | ✅ | Tabla completa de endpoints en el README |
| JWT access corto + refresh con rotación y revocación en BD | ✅ | `utils/jwt.js`, `tokenRepo.js` (rota y revoca verificados en runtime) |
| Middlewares: auth, roles, validación, errores, rate limit, CORS, helmet, logging | ✅ | `BACKEND/middlewares/*`, `config/logger.js`, `morgan` |
| MySQL con `mysql2` (pool, consultas parametrizadas, transacciones) | ✅ | `config/db.js` (sin SQL concatenado) |
| Documentación de la API en el README | ✅ | README §Documentación de la API (método, ruta, params, body, respuestas, errores) |
| Swagger en `/api/docs` (opcional) | ⛔ | No implementado (`swagger-ui-express` está en `dependencies` pero no se expone ninguna ruta) |

## 6. Base de datos

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Scripts numerados y ejecutables en orden | ✅ | `SQL/01_schema` → `06_triggers_procedures` |
| Tablas mínimas del brief | ✅ | 13 tablas: `usuarios`, `roles`, `proveedores_oauth`, `refresh_tokens`, `categorias`, `productos`, `equivalencias`, `stock`, `movimientos_stock`, `historial_precios`, `alertas_stock`, `auditoria`, `configuracion` |
| `equivalencias` 1-N con productos (OEM/A/S) | ✅ | `equivalencias.producto_id` + `tipo` |
| Diagrama ER y justificación de la normalización | ✅ | [Diagramas.md](Diagramas.md) (Mermaid + tablas) |
| Índices sobre código, medidas (eje/aloj/alt) y FULLTEXT | ✅ | [03_indexes.sql](../SQL/03_indexes.sql) |
| Procedimientos / triggers | ✅ | `sp_registrar_movimiento`, `tr_alertas_stock` |
| Vistas útiles | ✅ | [05_views.sql](../SQL/05_views.sql) (5 vistas) |

## 7. Organización del proyecto

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Raíz sólo `server.js` + `package.json` (+ configs imprescindibles) | ✅ | [server.js](../server.js), `package.json`, `.gitignore`, `.env.example`, `README.md` |
| Frontend separado con su propio entorno Expo | ✅ | `client/` (justificado en el README) |
| Backend en carpetas (routes, controllers, middlewares, repositories, config, utils) | ✅ | `BACKEND/` |
| `Components/` con Atomic Design | ✅ | `client/Components/atoms|molecules|organisms` |
| `Screens/` `Navigation/` `Store/` `Services/` `Utils/` `Assets/` `Styles/` | ✅ | `client/` (carpeta de assets en minúscula: `assets/`) |
| `SQL/` y `Docs/` | ✅ | Ambas presentes |
| `Tests/` | ✅ | [Tests/utils.test.js](../Tests/utils.test.js) — `npm test` (7 pruebas, `node:test`, sin dependencias) |

## 8. Buenas prácticas

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Atomic Design / componentes atómicos y reutilizables (DRY) | ✅ | `client/Components/*`, `cn()` y utilidades compartidas |
| Código limpio, nombres descriptivos, JSDoc, sin hardcodeos | ✅ | Config centralizada en `.env` + `BACKEND/config/env.js` |
| Conventional Commits + historial sugerido | ⚠️ | Historial sugerido documentado en el README. El historial real del repo es previo y genérico ("commit changes") |
| Linter y formateador (ESLint + Prettier) | ✅ | `.eslintrc.json`, `.prettierrc`, `.prettierignore`; scripts `npm run lint` / `npm run format` (ambos limpios) |

## 9. Entregables

| # | Entregable | Estado | Ubicación |
| --- | --- | --- | --- |
| 1 | Código fuente completo (frontend + backend) | ✅ | `/` y `client/` |
| 2 | Scripts SQL + script de importación del Excel | ✅ | `SQL/`, `BACKEND/import/` |
| 3 | README con descripción, stack, instalación, credenciales y API | ✅ | [README.md](../README.md) |
| 4 | Manual de usuario | ✅ | [Manual_de_Usuario.md](Manual_de_Usuario.md) |
| 5 | Guía de instalación y configuración | ✅ | [Guia_de_Instalacion.md](Guia_de_Instalacion.md) |
| 6 | Guía para generar el APK (EAS Build) + `eas.json` | ⚠️ | [Guia_APK.md](Guia_APK.md) + `client/eas.json`. Falta ejecutar el build real (requiere cuenta Expo) |
| 7 | `.gitignore` y `.env.example` | ✅ | Raíz y `client/` |
| 8 | Guion para el video de demostración (opcional) | ✅ | [Guion_Video.md](Guion_Video.md) |

## 10. Forma de trabajo

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Plan de arquitectura previo con confirmación del usuario | ✅ | Aprobado (árbol de carpetas, ER, endpoints y mapa de pantallas) |
| Desarrollo por etapas (a) BD+importación, (b) backend, (c) frontend base, (d) auth/roles, (e) módulos, (f) documentación, (g) APK | ✅ | Etapas (a)–(f) completas; (g) documentada y configurada, build pendiente de ejecutar |
| Comandos de prueba y checklist por etapa | ✅ | README + este documento |
| Decisiones técnicas justificadas ante ambigüedad (Bootstrap vs Tailwind) | ✅ | README §Sistema de estilos y grilla, `Grid.js` |

---

## Resumen de pendientes

| Pendiente | Tipo | Acción sugerida |
| --- | --- | --- |
| Swagger en `/api/docs` | Opcional (brief) | Exponer `swagger-ui-express` con un `openapi.json` o quitar la dependencia |
| Credenciales OAuth reales | Configuración | Cargar `GOOGLE_/FACEBOOK_/GITHUB_CLIENT_ID` y `_SECRET` en `.env` |
| Build del APK | Ejecución | `eas build -p android --profile preview` (ver [Guia_APK.md](Guia_APK.md)) |
| Exportación `.xlsx` nativa | Mejora | El CSV actual (BOM + `;`) ya abre correctamente en Excel |
| Historial real de commits con Conventional Commits | Proceso | Usar el historial sugerido del README para los próximos commits |
| Pruebas de integración/E2E de la API | Mejora | Ampliar `Tests/` con casos sobre la API en ejecución |

## Verificaciones ejecutadas en runtime

- Backend levantado en `http://localhost:4000` → `/health` responde `{"ok":true,...}`.
- Login `admin@retenes.com` → rol **Administrador**; access y refresh emitidos.
- **Rotación de refresh**: el par nuevo es distinto; reutilizar el refresh anterior → **401** (revocado).
- **RBAC Vendedor**: `GET /productos` → 200; `POST /productos` → 403; `GET /usuarios` → 403.
- **Movimiento transaccional**: producto `11056500` con stock 0 → ingreso de 10 → `stockNuevo = 10`.
- **Búsqueda por medidas**: `eje=30&tolerancia=0.5` → 12 resultados.
- **Dashboard**: 10 claves de KPI devueltas correctamente.
- **Lint/Formato**: `npx eslint . --ext .js` sin problemas; `npx prettier --check` OK.
- **Tests**: `npm test` → 7/7 en verde.
- **Compilación web (Expo)**: `npx expo export --platform web` → exit 0 (645 módulos).

## Verificación manual pendiente (no automatizable aquí)

- Login y navegación por rol en navegador y en Android (Expo Go / APK).
- Cambio de tema claro/oscuro persistido tras reiniciar la app.
- Flujo completo de re-importación de precios con vista previa.
- Login con proveedores sociales (requiere credenciales OAuth).
