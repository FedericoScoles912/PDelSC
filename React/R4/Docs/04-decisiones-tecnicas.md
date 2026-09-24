# Decisiones Técnicas

Este documento justifica la elección de cada pieza del stack tecnológico del portfolio. Cada decisión se tomó buscando tres atributos: **simplicidad de despliegue**, **buena experiencia en desarrollo** y **alineación con las consignas académicas**.

---

## 1. PostgreSQL vs. MySQL / SQLite / MongoDB

**Elegido:** PostgreSQL.

| Aspecto | Por qué PostgreSQL y no el resto |
|---------|----------------------------------|
| **Despliegue en PaaS** | Render, Railway y Supabase tienen soporte **nativo, directo y gratuito** para instancias de PostgreSQL. MySQL en cambio requiere planes más caros o configuración extra en algunos proveedores. |
| **Tipos de datos robustos** | Necesitamos un arreglo de tags en `projects.tags`. PostgreSQL cuenta con `TEXT[]` (arreglos nativos) y `JSONB` de serie, lo que evita crear tablas intermedias `projects_tags` en esta etapa. |
| **Consistencia y constraints** | Los `CHECK` (ej: `skills.level BETWEEN 0 AND 100`), `SERIAL` e índices parciales funcionan de forma nativa y predecible. |
| **Descartado MySQL** | Aunque es muy popular, su configuración en Render/Railway no es tan directa, y los tipos de datos son menos expresivos para lo que necesitamos. |
| **Descartado SQLite** | No funciona bien en despliegues serverless/PaaS (los archivos se pierden entre reinicios de instancia). |
| **Descartado MongoDB** | No hay documentos anidados complejos, las entidades son perfectamente tabulares, y la consigna pide explícitamente una base **SQL**. |

---

## 2. Vite vs. Create React App (CRA)

**Elegido:** Vite 5.

| Aspecto | Por qué Vite y no CRA |
|---------|----------------------|
| **ESM nativo en desarrollo** | Vite no empaqueta todo el código en cada cambio: sirve los módulos ES6 directamente al navegador. El servidor arranca en ~300 ms y el HMR (Hot Module Replacement) es instantáneo, incluso a medida que crecen los componentes. |
| **Build rápido** | Usa `esbuild` (Go) para el pre-bundling y Rollup para la producción. El `npm run build` de un portfolio de tamaño medio tarda segundos, no minutos. |
| **Variables de entorno tipadas** | Las variables con prefijo `VITE_` se inyectan en `import.meta.env` de forma explícita y segura (nunca se exponen variables sin el prefijo). |
| **CRA está deprecado** | El equipo de React ya no recomienda Create React App como inicio de proyectos nuevos. Vite es el standard de facto para proyectos React + TS/JS actuales. |
| **Sin bloat** | Vite no trae Webpack, Jest o configuraciones por defecto que no usamos. |

---

## 3. Framer Motion vs. CSS puro / React Spring / GSAP

**Elegido:** Framer Motion.

| Aspecto | Por qué Framer Motion |
|---------|----------------------|
| **API declarativa** | Animaciones como `initial / animate / exit`, `whileHover` y `whileInView` se expresan como props en los componentes, sin tener que escribir imperativamente timelines de CSS keyframes manuales. |
| **Stagger y viewport triggers nativos** | Para la galería de proyectos, la timeline de experiencia y la lista de skills queríamos que los elementos aparezcan en cascada ("stagger") al scrollear. Framer Motion lo resuelve con `staggerChildren` y `whileInView` en pocas líneas; con CSS puro habría que detectar el viewport con IntersectionObserver y clases dinámicas por cada elemento. |
| **MotionValues y transiciones finas** | Controlar `type: "spring"`, `damping`, `stiffness`, `ease` es trivial y consistente entre componentes. |
| **Descartado CSS puro** | Para secuencias de entrada, viewport-aware y stagger, implicaba mucho código imperativo (IntersectionObserver + clases + delays por hijo) que es fuente de bugs. |
| **Descartado React Spring / GSAP** | Tienen un modelo mental más imperativo y mayor boilerplate para los casos sencillos que usamos aquí. |

---

## 4. Bootstrap (solo grid) + Tailwind CSS

**Elegido:** Tailwind como sistema de utilidades principal, Bootstrap **unicamente por el sistema de grilla** (colocación `container/row/col-*-*`).

| Aspecto | Justificación |
|---------|---------------|
| **Cumplir la consigna** | Se requería explícitamente el uso de Bootstrap. En vez de duplicar sistemas de estilos (Bootstrap entero + Tailwind, generando conflictos de reset, tipografía y `!important`), importamos **solo la capa grid** de Bootstrap 5. De esa forma se cumple la consigna técnica sin sobrecostos. |
| **Tailwind para el resto** | Botones, cards, navbar, espaciados, tipografía, colores, estados hover/focus y variantes de tema se resuelven mucho más rápido y con menos CSS escrito con las utility classes de Tailwind. |
| **Sin colisiones** | El Bootstrap-grid se limita a `.container`, `.row`, `.col-*`, `.offset-*` y media queries, que no chocan con las clases atómicas de Tailwind. |

---

## 5. ESM everywhere (CommonJS deprecado)

**Elegido:** Todo el proyecto (frontend Vite y backend Node) usa **ECMAScript Modules** (`import/export`).

- `package.json` declara `"type": "module"`.
- `server.js`, `/Routes/*.js` y `/Database/connection.js` usan `import` en vez de `require()`.
- Vite ya es ESM nativo por diseño.

**Por qué:**
- Una misma sintaxis en todo el proyecto, sin mental-switch entre `require()` e `import`.
- Futuro compatible con Vite, Next, Remix y el ecosistema moderno (cada vez más paquetes publican solo ESM).
- Tree-shaking más eficiente en producción.

---

## 6. Tema Otoñal (paleta cálida)

**Elegido:** Paleta en tonos **terracota, naranja, ámbar, marrón y crema** (no blanco ni negro puros).

| Motivo | Explicación |
|--------|-------------|
| **Accesibilidad visual** | El blanco puro (`#FFFFFF`) sobre fondo muy oscuro y viceversa generan fatiga visual en horas de uso prolongado. Los tonos crema (`#FDF6EC`) y marrón oscuro suave (`#2B1D12`) mantienen contraste WCAG AA sin el "golpe" visual de los extremos. |
| **Identidad / personalidad** | Un portfolio no es una dashboard administrativa. Los tonos otoñales transmiten calidez, cercanía y distinción, alejándose del default "blanco + azul corporate" que tienen el 90% de los portfolios genéricos. |
| **Consistencia cross-sección** | Hero, cards, badges, botones, timeline y footer usan la misma escala (50/100/200…800/900) definida en `tailwind.config.js` + variables en `Styles/theme.css`. Cualquier componente nuevo se estiliza con tokens predecibles. |
| **Framer Motion synergy** | Los tonos cálidos se acentúan mucho mejor con animaciones sutiles de color/opacity que los fríos, generando un efecto más agradable. |
