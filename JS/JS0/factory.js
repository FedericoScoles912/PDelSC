import fs from 'fs';
import path from 'path';

const projects = [
    {
        name: 'push', port: 3001, color: 'primary',
        cases: [
            { id: 1, title: 'Frutas', initial: '[]', logic: 'const copy = [...initial]; copy.push("Manzana", "Pera", "Naranja"); return copy;' },
            { id: 2, title: 'Amigos', initial: '["Fede", "Gaston"]', logic: 'const copy = [...initial]; copy.push("Lucas", "Juan", "Maria"); return copy;' },
            { id: 3, title: 'Números (Mayor al último)', initial: '[10, 20, 30]', logic: 'const copy = [...initial]; const nuevo = 35; if(nuevo > copy[copy.length-1]) copy.push(nuevo); return copy;' }
        ]
    },
    {
        name: 'pop', port: 3002, color: 'success',
        cases: [
            { id: 1, title: 'Animales', initial: '["Perro", "Gato", "Loro"]', logic: 'const copy = [...initial]; copy.pop(); return copy;' },
            { id: 2, title: 'Lista Compras', initial: '["Pan", "Leche", "Agua"]', logic: 'const copy = [...initial]; const eliminado = copy.pop(); return { resultado: copy, eliminado };' },
            { id: 3, title: 'Vaciar Array (While)', initial: '[1, 2, 3, 4, 5]', logic: 'const copy = [...initial]; while(copy.length > 0) { copy.pop(); } return copy;' }
        ]
    },
    {
        name: 'unshift', port: 3003, color: 'info',
        cases: [
            { id: 1, title: 'Colores', initial: '[]', logic: 'const copy = [...initial]; copy.unshift("Rojo", "Verde", "Azul"); return copy;' },
            { id: 2, title: 'Tareas Urgentes', initial: '["Tarea 1", "Tarea 2"]', logic: 'const copy = [...initial]; copy.unshift("TAREA URGENTE"); return copy;' },
            { id: 3, title: 'Usuarios Conectados', initial: '["User1", "User2"]', logic: 'const copy = [...initial]; copy.unshift("Nuevo Usuario"); return copy;' }
        ]
    },
    {
        name: 'shift', port: 3004, color: 'warning',
        cases: [
            { id: 1, title: 'Enteros', initial: '[10, 20, 30]', logic: 'const copy = [...initial]; copy.shift(); return copy;' },
            { id: 2, title: 'Mensajes Chat', initial: '["Hola", "Cómo va?", "Todo bien"]', logic: 'const copy = [...initial]; copy.shift(); return copy;' },
            { id: 3, title: 'Cola Atención', initial: '["Cliente A", "Cliente B", "Cliente C"]', logic: 'const copy = [...initial]; const atendido = copy.shift(); return { restante: copy, atendido };' }
        ]
    },
    {
        name: 'splice', port: 3005, color: 'danger',
        cases: [
            { id: 1, title: 'Eliminar Letras', initial: '["A", "B", "C", "D"]', logic: 'const copy = [...initial]; copy.splice(1, 2); return copy;' },
            { id: 2, title: 'Insertar sin borrar', initial: '["Fede", "Lucas"]', logic: 'const copy = [...initial]; copy.splice(1, 0, "Gaston"); return copy;' },
            { id: 3, title: 'Reemplazar elementos', initial: '["Uno", "Dos", "Tres"]', logic: 'const copy = [...initial]; copy.splice(1, 2, "Nuevo2", "Nuevo3"); return copy;' }
        ]
    },
    {
        name: 'slice', port: 3006, color: 'secondary',
        cases: [
            { id: 1, title: 'Primeros 3', initial: '[10, 20, 30, 40, 50]', logic: 'return initial.slice(0, 3);' },
            { id: 2, title: 'Parcial (2 a 4)', initial: '["Peli1", "Peli2", "Peli3", "Peli4", "Peli5"]', logic: 'return initial.slice(2, 4);' },
            { id: 3, title: 'Últimos 3', initial: '["A", "B", "C", "D", "E"]', logic: 'return initial.slice(-3);' }
        ]
    },
    {
        name: 'indexOf', port: 3007, color: 'primary',
        cases: [
            { id: 1, title: 'Posición "perro"', initial: '["gato", "perro", "pájaro"]', logic: 'return initial.indexOf("perro");' },
            { id: 2, title: '¿Está el 50?', initial: '[10, 20, 50, 100]', logic: 'return initial.indexOf(50);' },
            { id: 3, title: 'Índice de "Madrid"', initial: '["Paris", "Londres", "Madrid"]', logic: 'const idx = initial.indexOf("Madrid"); return idx !== -1 ? idx : "No está";' }
        ]
    },
    {
        name: 'includes', port: 3008, color: 'success',
        cases: [
            { id: 1, title: 'Contiene "admin"', initial: '["user", "admin", "guest"]', logic: 'return initial.includes("admin");' },
            { id: 2, title: '¿Existe "verde"?', initial: '["rojo", "azul", "amarillo"]', logic: 'return initial.includes("verde");' },
            { id: 3, title: 'Validar antes de sumar', initial: '[1, 2, 3]', logic: 'const num = 4; const copy = [...initial]; if(!copy.includes(num)) copy.push(num); return copy;' }
        ]
    },
    {
        name: 'forEach', port: 3009, color: 'dark',
        cases: [
            { id: 1, title: 'Saludo', initial: '["Fede", "Gaston"]', logic: 'const res = []; initial.forEach(n => res.push("Hola " + n)); return res;' },
            { id: 2, title: 'Doble de cada número', initial: '[1, 2, 3]', logic: 'const res = []; initial.forEach(n => res.push(n * 2)); return res;' },
            { id: 3, title: 'Nombre y Edad', initial: '[{nombre: "Fede", edad: 25}, {nombre: "Gaston", edad: 30}]', logic: 'const res = []; initial.forEach(o => res.push(o.nombre + " tiene " + o.edad + " años")); return res;' }
        ]
    },
    {
        name: 'map', port: 3010, color: 'primary',
        cases: [
            { id: 1, title: 'Multiplicar x3', initial: '[1, 2, 3]', logic: 'return initial.map(n => n * 3);' },
            { id: 2, title: 'Mayúsculas', initial: '["fede", "gaston"]', logic: 'return initial.map(n => n.toUpperCase());' },
            { id: 3, title: 'Precios + IVA', initial: '[100, 200, 300]', logic: 'return initial.map(p => Number((p * 1.21).toFixed(2)));' }
        ]
    },
    {
        name: 'filter', port: 3011, color: 'success',
        cases: [
            { id: 1, title: 'Mayores a 10', initial: '[5, 12, 8, 130, 44]', logic: 'return initial.filter(n => n > 10);' },
            { id: 2, title: 'Palabras > 5 letras', initial: '["sol", "computadora", "casa", "javascript"]', logic: 'return initial.filter(p => p.length > 5);' },
            { id: 3, title: 'Usuarios Activos', initial: '[{n: "Fede", activo: true}, {n: "Gaston", activo: false}]', logic: 'return initial.filter(u => u.activo);' }
        ]
    },
    {
        name: 'reduce', port: 3012, color: 'danger',
        cases: [
            { id: 1, title: 'Suma Total', initial: '[1, 2, 3, 4]', logic: 'return initial.reduce((a, b) => a + b, 0);' },
            { id: 2, title: 'Multiplicación Total', initial: '[1, 2, 3, 4]', logic: 'return initial.reduce((a, b) => a * b, 1);' },
            { id: 3, title: 'Total Precios', initial: '[{p: 100}, {p: 200}, {p: 300}]', logic: 'return initial.reduce((a, b) => a + b.p, 0);' }
        ]
    },
    {
        name: 'sort', port: 3013, color: 'info',
        cases: [
            { id: 1, title: 'Números Ascendente', initial: '[40, 100, 1, 5]', logic: 'return [...initial].sort((a, b) => a - b);' },
            { id: 2, title: 'Alfabéticamente', initial: '["Pera", "Manzana", "Ananá"]', logic: 'return [...initial].sort();' },
            { id: 3, title: 'Por Edad', initial: '[{n: "Z", e: 30}, {n: "A", e: 20}]', logic: 'return [...initial].sort((a, b) => a.e - b.e);' }
        ]
    },
    {
        name: 'reverse', port: 3014, color: 'warning',
        cases: [
            { id: 1, title: 'Letras Invertidas', initial: '["A", "B", "C"]', logic: 'return [...initial].reverse();' },
            { id: 2, title: 'Números Invertidos', initial: '[1, 2, 3]', logic: 'return [...initial].reverse();' },
            { id: 3, title: 'String Revertido', initial: '"JavaScript"', logic: 'return initial.split("").reverse().join("");' }
        ]
    }
];

projects.forEach(p => {
    const dir = path.join('c:/Users/fedes/OneDrive/Documentos/GitHub/PDelSC/JS/JS0/Projects', p.name);
    
    // HTML con 3 casos y arrays iniciales permanentes
    const htmlCode = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proyecto ${p.name.toUpperCase()}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background: #f8f9fa; min-height: 100vh; padding: 20px; }
        .card { border-radius: 15px; border: none; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .result-box { background: #2d3436; color: #fff; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 0.9rem; }
        .label { font-weight: bold; color: #636e72; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 4px; display: block; }
        .value { color: #00cec9; }
        .case-container { border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px; }
        .case-container:last-child { border-bottom: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="card p-4">
                    <h2 class="text-center text-${p.color} mb-4">.${p.name}() - 3 Casos</h2>
                    
                    ${p.cases.map(c => `
                    <div class="case-container">
                        <h5 class="mb-3">${c.id}. ${c.title}</h5>
                        <div class="row">
                            <div class="col-md-12">
                                <span class="label">Array Inicial:</span>
                                <div class="result-box mb-3"><span class="value">${c.initial}</span></div>
                            </div>
                            <div class="col-md-12">
                                <button id="btn-${c.id}" class="btn btn-sm btn-${p.color} mb-3" onclick="ejecutar(${c.id})">Ejecutar Caso ${c.id}</button>
                            </div>
                            <div class="col-md-12" id="res-container-${c.id}" style="display: none;">
                                <span class="label">Resultado:</span>
                                <div class="result-box"><span class="value" id="final-${c.id}"></span></div>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>`;

    // Script con lógica para los 3 casos y desactivación de botones
    const scriptCode = `const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);

    let final;
    switch(caseId) {
        ${p.cases.map(c => `
        case ${c.id}:
            {
                const initial = ${c.initial.startsWith('"') ? c.initial : c.initial};
                final = (() => {
                    ${c.logic}
                })();
            }
            break;`).join('')}
    }

    finalSpan.innerText = JSON.stringify(final, null, 2);
    resContainer.style.display = 'block';
    
    // Desactivar botón tras un solo uso
    btn.disabled = true;
    btn.innerText = "Ejecutado";
    btn.classList.add('btn-secondary');
    btn.classList.remove('btn-${p.color}');

    console.log("Caso " + caseId + " ejecutado:", final);
};`;

    fs.writeFileSync(path.join(dir, 'index.html'), htmlCode);
    fs.writeFileSync(path.join(dir, 'script.js'), scriptCode);
});
