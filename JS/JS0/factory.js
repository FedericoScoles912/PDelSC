// Importación de módulos necesarios
import fs from 'fs';       // Módulo de sistema de archivos para leer/escribir archivos
import path from 'path';   // Módulo de rutas para manejar rutas de archivos

/**
 * Configuración de todos los proyectos
 * Cada objeto representa un método de array con su información y casos de uso
 */
const projects = [
  {
    name: 'push', port: 3001, color: 'primary',
    cases: [
      { id: 1, title: 'Frutas (3 inputs)', initial: '[]', inputs: 3, placeholders: ['Fruta 1', 'Fruta 2', 'Fruta 3'], logic: 'const copy = [...initial]; copy.push(inputs[0], inputs[1], inputs[2]); return copy;' },
      { id: 2, title: 'Amigos (3 inputs)', initial: '["Fede", "Gaston"]', inputs: 3, placeholders: ['Amigo 1', 'Amigo 2', 'Amigo 3'], logic: 'const copy = [...initial]; copy.push(inputs[0], inputs[1], inputs[2]); return copy;' },
      { id: 3, title: 'Números (Mayor al último)', initial: '[10, 20, 30]', inputs: 1, inputType: 'number', placeholder: 'Número > 30', logic: 'const copy = [...initial]; const val = Number(inputs[0]); if(val > copy[copy.length-1]) { copy.push(val); return copy; } else { throw "El número debe ser mayor a " + copy[copy.length-1]; }' }
    ]
  },
  {
    name: 'pop', port: 3002, color: 'success',
    cases: [
      { id: 1, title: 'Animales', initial: '["Perro", "Gato", "Loro"]', inputs: 0, logic: 'const copy = [...initial]; const el = copy.pop(); return { resultado: copy, eliminado: el };' },
      { id: 2, title: 'Lista Compras', initial: '["Pan", "Leche", "Agua"]', inputs: 0, logic: 'const copy = [...initial]; const el = copy.pop(); return { resultado: copy, eliminado: el };' },
      { id: 3, title: 'Vaciar Array', initial: '[1, 2, 3]', inputs: 0, logic: 'const copy = [...initial]; while(copy.length > 0) copy.pop(); return copy;' }
    ]
  },
  {
    name: 'unshift', port: 3003, color: 'info',
    cases: [
      { id: 1, title: 'Colores (3 inputs)', initial: '[]', inputs: 3, placeholders: ['Color 1', 'Color 2', 'Color 3'], logic: 'const copy = [...initial]; copy.unshift(inputs[0], inputs[1], inputs[2]); return copy;' },
      { id: 2, title: 'Tareas Urgentes', initial: '["Tarea 1", "Tarea 2"]', inputs: 1, placeholder: 'Tarea urgente', logic: 'const copy = [...initial]; copy.unshift(inputs[0]); return copy;' },
      { id: 3, title: 'Usuarios Conectados', initial: '["User1", "User2"]', inputs: 1, placeholder: 'Nuevo login', logic: 'const copy = [...initial]; copy.unshift(inputs[0]); return copy;' }
    ]
  },
  {
    name: 'shift', port: 3004, color: 'warning',
    cases: [
      { id: 1, title: 'Enteros', initial: '[10, 20, 30]', inputs: 0, logic: 'const copy = [...initial]; const el = copy.shift(); return { resultado: copy, eliminado: el };' },
      { id: 2, title: 'Mensajes Chat', initial: '["Hola", "Chau"]', inputs: 0, logic: 'const copy = [...initial]; copy.shift(); return copy;' },
      { id: 3, title: 'Cola Atención', initial: '["Cliente1", "Cliente2"]', inputs: 0, logic: 'const copy = [...initial]; const atendido = copy.shift(); return { restante: copy, atendido };' }
    ]
  },
  {
    name: 'splice', port: 3005, color: 'danger',
    cases: [
      { id: 1, title: 'Eliminar en pos 1', initial: '["A", "B", "C", "D"]', inputs: 0, logic: 'const copy = [...initial]; copy.splice(1, 2); return copy;' },
      { id: 2, title: 'Insertar en pos 1', initial: '["Fede", "Lucas"]', inputs: 1, placeholder: 'Nombre a insertar', logic: 'const copy = [...initial]; copy.splice(1, 0, inputs[0]); return copy;' },
      { id: 3, title: 'Reemplazar en pos 1 (2 inputs)', initial: '["Uno", "Dos", "Tres"]', inputs: 2, placeholders: ['Reemplazo 1', 'Reemplazo 2'], logic: 'const copy = [...initial]; copy.splice(1, 2, inputs[0], inputs[1]); return copy;' }
    ]
  },
  {
    name: 'slice', port: 3006, color: 'secondary',
    cases: [
      { id: 1, title: 'Primeros 3', initial: '[10, 20, 30, 40, 50]', inputs: 0, logic: 'return initial.slice(0, 3);' },
      { id: 2, title: 'Parcial (2 a 4)', initial: '["P1", "P2", "P3", "P4", "P5"]', inputs: 0, logic: 'return initial.slice(2, 4);' },
      { id: 3, title: 'Últimos 3', initial: '["A", "B", "C", "D", "E"]', inputs: 0, logic: 'return initial.slice(-3);' }
    ]
  },
  {
    name: 'indexOf', port: 3007, color: 'primary',
    cases: [
      { id: 1, title: 'Posición de "perro"', initial: '["gato", "perro", "pájaro"]', inputs: 0, logic: 'return initial.indexOf("perro");' },
      { id: 2, title: '¿Está el 50?', initial: '[10, 20, 50, 100]', inputs: 0, logic: 'return initial.indexOf(50);' },
      { id: 3, title: 'Índice de "Madrid"', initial: '["Paris", "Londres", "Madrid", "Barcelona"]', inputs: 0, logic: 'const idx = initial.indexOf("Madrid"); return idx !== -1 ? idx : "No está";' }
    ]
  },
  {
    name: 'includes', port: 3008, color: 'success',
    cases: [
      { id: 1, title: 'Contiene "admin"', initial: '["user", "admin", "guest"]', inputs: 0, logic: 'return initial.includes("admin");' },
      { id: 2, title: '¿Existe "verde"?', initial: '["rojo", "azul", "amarillo"]', inputs: 0, logic: 'return initial.includes("verde");' },
      { id: 3, title: 'Verificar antes de sumar', initial: '[1, 2, 3]', inputs: 0, logic: 'const num = 4; const copy = [...initial]; if(!copy.includes(num)) copy.push(num); return copy;' }
    ]
  },
  {
    name: 'forEach', port: 3009, color: 'dark',
    cases: [
      { id: 1, title: 'Saludo', initial: '["Fede", "Gaston"]', inputs: 1, placeholder: 'Saludo (ej: Hola)', logic: 'const res = []; initial.forEach(n => res.push(inputs[0] + " " + n)); return res;' },
      { id: 2, title: 'Imprimir doble', initial: '[1, 2, 3]', inputs: 0, logic: 'const res = []; initial.forEach(n => res.push(n * 2)); return res;' },
      { id: 3, title: 'Nombre y Edad', initial: '[{nombre: "Fede", edad: 25}, {nombre: "Gaston", edad: 30}]', inputs: 0, logic: 'const res = []; initial.forEach(o => res.push(o.nombre + " tiene " + o.edad + " años")); return res;' }
    ]
  },
  {
    name: 'map', port: 3010, color: 'primary',
    cases: [
      { id: 1, title: 'Multiplicar x3', initial: '[1, 2, 3]', inputs: 0, logic: 'return initial.map(n => n * 3);' },
      { id: 2, title: 'Mayúsculas', initial: '["fede", "gaston"]', inputs: 0, logic: 'return initial.map(n => n.toUpperCase());' },
      { id: 3, title: 'Precios + IVA', initial: '[100, 200, 300]', inputs: 0, logic: 'return initial.map(p => Number((p * 1.21).toFixed(2)));' }
    ]
  },
  {
    name: 'filter', port: 3011, color: 'success',
    cases: [
      { id: 1, title: 'Mayores a 10', initial: '[5, 12, 8, 130, 44]', inputs: 0, logic: 'return initial.filter(n => n > 10);' },
      { id: 2, title: 'Palabras > 5 letras', initial: '["sol", "computadora", "casa", "javascript"]', inputs: 0, logic: 'return initial.filter(p => p.length > 5);' },
      { id: 3, title: 'Usuarios Activos', initial: '[{n: "Fede", activo: true}, {n: "Gaston", activo: false}]', inputs: 0, logic: 'return initial.filter(u => u.activo);' }
    ]
  },
  {
    name: 'reduce', port: 3012, color: 'danger',
    cases: [
      { id: 1, title: 'Suma Total', initial: '[1, 2, 3, 4]', inputs: 0, logic: 'return initial.reduce((a, b) => a + b, 0);' },
      { id: 2, title: 'Multiplicación Total', initial: '[1, 2, 3, 4]', inputs: 0, logic: 'return initial.reduce((a, b) => a * b, 1);' },
      { id: 3, title: 'Total Precios', initial: '[{p: 100}, {p: 200}, {p: 300}]', inputs: 0, logic: 'return initial.reduce((a, b) => a + b.p, 0);' }
    ]
  },
  {
    name: 'sort', port: 3013, color: 'info',
    cases: [
      { id: 1, title: 'Números Ascendente', initial: '[40, 100, 1, 5]', inputs: 0, logic: 'return [...initial].sort((a, b) => a - b);' },
      { id: 2, title: 'Alfabéticamente', initial: '["Pera", "Manzana", "Ananá"]', inputs: 0, logic: 'return [...initial].sort();' },
      { id: 3, title: 'Por Edad', initial: '[{n: "Z", e: 30}, {n: "A", e: 20}]', inputs: 0, logic: 'return [...initial].sort((a, b) => a.e - b.e);' }
    ]
  },
  {
    name: 'reverse', port: 3014, color: 'warning',
    cases: [
      { id: 1, title: 'Letras Invertidas', initial: '["A", "B", "C"]', inputs: 0, logic: 'return [...initial].reverse();' },
      { id: 2, title: 'Números Invertidos', initial: '[1, 2, 3]', inputs: 0, logic: 'return [...initial].reverse();' },
      { id: 3, title: 'String Revertido', initial: null, inputs: 1, placeholder: 'Ingresa texto', logic: 'return inputs[0].split("").reverse().join("");' }
    ]
  }
];

// Iterar sobre cada proyecto para generar sus archivos
projects.forEach(p => {
  // Definir la ruta del directorio del proyecto
  const dir = path.join('c:/Users/fedes/OneDrive/Documentos/GitHub/PDelSC/JS/JS0/Projects', p.name);
  
  // Bandera para identificar el proyecto 'reverse' y aplicar estilos RTL
  const isReverse = p.name === 'reverse';

  /**
   * Plantilla HTML para cada proyecto
   * Incluye estilos, estructura y mapeo de casos de uso
   */
  const htmlCode = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proyecto ${p.name.toUpperCase()}</title>
    <!-- Bootstrap 5 para estilos predefinidos -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        /* Variables CSS para modo claro y oscuro */
        :root {
            --bg-body: #f8f9fa;
            --bg-card: #ffffff;
            --text-primary: #212529;
            --text-label: #636e72;
            --text-value: #00cec9;
            --bg-result: #2d3436;
            --text-result: #ffffff;
            --shadow-card: rgba(0,0,0,0.1);
            --btn-primary: #0d6efd;
            --btn-primary-hover: #0b5ed7;
        }

        /* Estilos generales del body */
        body { background: var(--bg-body); color: var(--text-primary); min-height: 100vh; padding-top: 80px; transition: all 0.3s ease; }
        /* Estilos de las tarjetas: borde redondeado, sin borde, sombra */
        .card { background: var(--bg-card); border-radius: 15px; border: none; box-shadow: 0 10px 30px var(--shadow-card); transition: all 0.3s ease; }
        /* Estilos de la caja de resultados: fondo oscuro, texto claro, fuente monospace */
        .result-box { background: var(--bg-result); color: var(--text-result); padding: 16px; border-radius: 8px; font-family: monospace; font-size: 1rem; transition: all 0.3s ease; }
        /* Estilos de las etiquetas: negrita, color gris, texto en mayúsculas */
        .label { font-weight: bold; color: var(--text-label); font-size: 0.9rem; text-transform: uppercase; margin-bottom: 6px; display: block; }
        /* Color del valor dentro de la caja de resultados */
        .value { color: var(--text-value); }
        /* Estilos de los mensajes de error: color rojo, tamaño de fuente */
        .error-msg { color: #ff7675; font-size: 0.9rem; margin-top: 8px; font-weight: bold; }
        /* Estilo RTL para Reverse (derecha a izquierda) */
        .rtl-result { direction: rtl; text-align: right; }
        /* Navbar en modo claro/oscuro */
        .navbar { transition: all 0.3s ease; }
        /* Inputs en modo oscuro */
        .dark-mode .form-control { background-color: #2d3436; color: #ffffff; border-color: #495057; }
        .dark-mode .form-control:focus { background-color: #343a40; color: #ffffff; border-color: #00cec9; }
        /* Estilos para títulos y texto */
        h1, h2, h3, h4, h5, h6 { color: var(--text-primary); transition: color 0.3s ease; }
        /* Estilos para botones de Bootstrap */
        .btn-primary { background-color: var(--btn-primary); border-color: var(--btn-primary); }
        .btn-primary:hover { background-color: var(--btn-primary-hover); border-color: var(--btn-primary-hover); }
    </style>
</head>
<body>
    <!-- Barra de navegación superior -->
    <nav class="navbar navbar-dark bg-dark shadow-sm fixed-top" id="main-navbar">
        <div class="container">
            <!-- Botón para volver a la página principal -->
            <a href="/Pages/index.html" class="btn btn-light">
                &larr; Volver
            </a>
            <a class="navbar-brand d-flex align-items-center ms-3" href="#">
                <strong>.${p.name}()</strong>
            </a>
            <!-- Botón de modo claro/oscuro -->
            <button id="theme-toggle" class="btn btn-light">
                <span id="theme-icon">🌙</span>
                <span id="theme-text" class="d-none d-md-inline">Modo Oscuro</span>
            </button>
        </div>
    </nav>
    <!-- Contenedor fluido para aprovechar el ancho completo -->
    <div class="container-fluid px-5">
        <!-- Fila con contenido centrado -->
        <div class="row justify-content-center">
            <!-- Columna de 10/12 en pantallas extra grandes para centralizar -->
            <div class="col-xl-10">
                <!-- Tarjeta principal del proyecto -->
                <div class="card p-5">
                    <!-- Título del proyecto con color correspondiente -->
                    <h2 class="text-center text-${p.color} mb-5">.${p.name}() - Refinado</h2>
                    
                    <!-- Fila de ejercicios con espaciado entre columnas -->
                    <div class="row g-4">
                    ${p.cases.map(c => `
                    <!-- Cada ejercicio en una columna de 4/12 (3 por fila) -->
                    <div class="col-md-4">
                        <!-- Tarjeta del ejercicio con altura 100% para alinear -->
                        <div class="card p-4 h-100">
                            <h5 class="mb-4">${c.id}. ${c.title}</h5>
                            ${c.initial !== null ? `
                            <!-- Sección de array inicial (si existe) -->
                            <div class="mb-4">
                                <span class="label">Array Inicial:</span>
                                <div class="result-box mb-3"><span class="value">${c.initial}</span></div>
                            </div>
                            ` : ''}
                            ${c.inputs > 0 ? `
                            <!-- Sección de inputs (si el ejercicio requiere) -->
                            <div class="mb-4">
                                <div class="input-group">
                                    ${Array.from({length: c.inputs}).map((_, i) => `
                                    <!-- Campo de input con placeholder correspondiente -->
                                    <input type="${c.inputType || 'text'}" id="input-${c.id}-${i}" class="form-control" placeholder="${(c.placeholders && c.placeholders[i]) || c.placeholder || 'Valor'}">
                                    `).join('')}
                                </div>
                                <!-- Contenedor de mensaje de error (oculto por defecto) -->
                                <div id="error-${c.id}" class="error-msg" style="display: none;"></div>
                            </div>
                            ` : ''}
                            <!-- Botón para ejecutar el caso -->
                            <div>
                                <button id="btn-${c.id}" class="btn btn-${p.color} mb-3" onclick="ejecutar(${c.id})">Ejecutar Caso ${c.id}</button>
                            </div>
                            <!-- Contenedor de resultado (oculto por defecto) -->
                            <div id="res-container-${c.id}" style="display: none;">
                                <span class="label">Resultado:</span>
                                <div class="result-box ${isReverse ? 'rtl-result' : ''}"><span class="value" id="final-${c.id}"></span></div>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Script con la lógica del ejercicio -->
    <script src="script.js"></script>
</body>
</html>`;

  /**
   * Código JavaScript para la lógica de cada proyecto
   * Incluye la función ejecutar que maneja la interacción del usuario
   * y la lógica del modo claro/oscuro
   */
  const scriptCode = `
    // ======== Lógica del modo claro/oscuro ========
    function initTheme() {
        // Verificar preferencia guardada en localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            if (savedTheme === 'dark') {
                applyDarkMode();
            } else {
                applyLightMode();
            }
        } else {
            // Verificar preferencia del sistema
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                applyDarkMode();
            }
        }
    }

    function applyDarkMode() {
        // Agregar clase dark-mode al body
        document.body.classList.add('dark-mode');
        // Actualizar variables CSS para modo oscuro
        document.documentElement.style.setProperty('--bg-body', '#1a1a2e');
        document.documentElement.style.setProperty('--bg-card', '#16213e');
        document.documentElement.style.setProperty('--text-primary', '#eaeaea');
        document.documentElement.style.setProperty('--text-label', '#b2b2b2');
        document.documentElement.style.setProperty('--text-value', '#81ecec');
        document.documentElement.style.setProperty('--bg-result', '#0f0f23');
        document.documentElement.style.setProperty('--text-result', '#ffffff');
        document.documentElement.style.setProperty('--shadow-card', 'rgba(0,0,0,0.3)');
        document.documentElement.style.setProperty('--btn-primary', '#6c5ce7');
        document.documentElement.style.setProperty('--btn-primary-hover', '#5f4bd4');
        
        // Actualizar botón y navbar
        const toggleBtn = document.getElementById('theme-toggle');
        const toggleIcon = document.getElementById('theme-icon');
        const toggleText = document.getElementById('theme-text');
        const navbar = document.getElementById('main-navbar');
        
        toggleBtn.classList.remove('btn-light');
        toggleBtn.classList.add('btn-dark');
        toggleIcon.textContent = '☀️';
        toggleText.textContent = 'Modo Claro';
        
        navbar.classList.remove('bg-dark', 'navbar-dark');
        navbar.classList.add('bg-primary', 'navbar-light');
        
        // Guardar en localStorage
        localStorage.setItem('theme', 'dark');
    }

    function applyLightMode() {
        // Quitar clase dark-mode del body
        document.body.classList.remove('dark-mode');
        // Restablecer variables CSS a modo claro
        document.documentElement.style.setProperty('--bg-body', '#f8f9fa');
        document.documentElement.style.setProperty('--bg-card', '#ffffff');
        document.documentElement.style.setProperty('--text-primary', '#212529');
        document.documentElement.style.setProperty('--text-label', '#636e72');
        document.documentElement.style.setProperty('--text-value', '#00cec9');
        document.documentElement.style.setProperty('--bg-result', '#2d3436');
        document.documentElement.style.setProperty('--text-result', '#ffffff');
        document.documentElement.style.setProperty('--shadow-card', 'rgba(0,0,0,0.1)');
        
        // Actualizar botón y navbar
        const toggleBtn = document.getElementById('theme-toggle');
        const toggleIcon = document.getElementById('theme-icon');
        const toggleText = document.getElementById('theme-text');
        const navbar = document.getElementById('main-navbar');
        
        toggleBtn.classList.remove('btn-dark');
        toggleBtn.classList.add('btn-light');
        toggleIcon.textContent = '🌙';
        toggleText.textContent = 'Modo Oscuro';
        
        navbar.classList.remove('bg-primary', 'navbar-light');
        navbar.classList.add('bg-dark', 'navbar-dark');
        
        // Guardar en localStorage
        localStorage.setItem('theme', 'light');
    }

    // Event listener para el botón
    document.getElementById('theme-toggle').addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) {
            applyLightMode();
        } else {
            applyDarkMode();
        }
    });

    // Inicializar el tema al cargar la página
    initTheme();

    // ======== Lógica de los ejercicios ========
    const ejecutar = (caseId) => {
    // Obtener referencias a los elementos DOM del caso
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);
    const errorDiv = document.getElementById('error-' + caseId);

    // Recopilar los valores de los inputs del caso
    const inputs = [];
    let i = 0;
    while(document.getElementById('input-' + caseId + '-' + i)) {
        const val = document.getElementById('input-' + caseId + '-' + i).value;
        // Validar que todos los inputs estén completos
        if(!val) {
            if(errorDiv) {
                errorDiv.innerText = "Completa todos los campos.";
                errorDiv.style.display = 'block';
            }
            return;
        }
        inputs.push(val);
        i++;
    }

    let final;
    try {
        // Ejecutar la lógica correspondiente al caso
        switch(caseId) {
            ${p.cases.map(c => `
            case ${c.id}:
                {
                    // Definir el array inicial (si existe)
                    const initial = ${c.initial};
                    // Ejecutar la lógica del caso en una IIFE
                    final = (() => {
                        ${c.logic}
                    })();
                }
                break;`).join('')}
        }

        // Si no hay errores, ocultar el mensaje de error y mostrar el resultado
        if(errorDiv) errorDiv.style.display = 'none';
        finalSpan.innerText = JSON.stringify(final, null, 2);
        resContainer.style.display = 'block';
        
        // Desactivar el botón y inputs después de ejecutar
        btn.disabled = true;
        btn.innerText = "Ejecutado";
        btn.classList.add('btn-secondary');
        btn.classList.remove('btn-${p.color}');
        
        let j = 0;
        while(document.getElementById('input-' + caseId + '-' + j)) {
            document.getElementById('input-' + caseId + '-' + j).disabled = true;
            j++;
        }

    } catch (e) {
        // Mostrar mensaje de error si ocurre alguna excepción
        if(errorDiv) {
            errorDiv.innerText = e;
            errorDiv.style.display = 'block';
        }
    }
};`;

  // Escribir el archivo index.html del proyecto
  fs.writeFileSync(path.join(dir, 'index.html'), htmlCode);
  // Escribir el archivo script.js del proyecto
  fs.writeFileSync(path.join(dir, 'script.js'), scriptCode);
});
