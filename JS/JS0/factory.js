import fs from 'fs';
import path from 'path';

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

projects.forEach(p => {
    const dir = path.join('c:/Users/fedes/OneDrive/Documentos/GitHub/PDelSC/JS/JS0/Projects', p.name);
    
    // Si es el proyecto 'reverse', aplicamos estilos RTL
    const isReverse = p.name === 'reverse';

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
        .error-msg { color: #ff7675; font-size: 0.85rem; margin-top: 5px; font-weight: bold; }
        /* Estilo RTL para Reverse */
        .rtl-result { direction: rtl; text-align: right; }
    </style>
</head>
<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="card p-4">
                    <h2 class="text-center text-${p.color} mb-4">.${p.name}() - Refinado</h2>
                    
                    ${p.cases.map(c => `
                    <div class="case-container">
                        <h5 class="mb-3">${c.id}. ${c.title}</h5>
                        <div class="row">
                            ${c.initial !== null ? `
                            <div class="col-md-12">
                                <span class="label">Array Inicial:</span>
                                <div class="result-box mb-3"><span class="value">${c.initial}</span></div>
                            </div>
                            ` : ''}
                            ${c.inputs > 0 ? `
                            <div class="col-md-12 mb-3">
                                <div class="input-group input-group-sm">
                                    ${Array.from({length: c.inputs}).map((_, i) => `
                                    <input type="${c.inputType || 'text'}" id="input-${c.id}-${i}" class="form-control" placeholder="${(c.placeholders && c.placeholders[i]) || c.placeholder || 'Valor'}">
                                    `).join('')}
                                </div>
                                <div id="error-${c.id}" class="error-msg" style="display: none;"></div>
                            </div>
                            ` : ''}
                            <div class="col-md-12">
                                <button id="btn-${c.id}" class="btn btn-sm btn-${p.color} mb-3" onclick="ejecutar(${c.id})">Ejecutar Caso ${c.id}</button>
                            </div>
                            <div class="col-md-12" id="res-container-${c.id}" style="display: none;">
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
    <script src="script.js"></script>
</body>
</html>`;

    const scriptCode = `const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);
    const errorDiv = document.getElementById('error-' + caseId);

    // Obtener inputs
    const inputs = [];
    let i = 0;
    while(document.getElementById('input-' + caseId + '-' + i)) {
        const val = document.getElementById('input-' + caseId + '-' + i).value;
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
        switch(caseId) {
            ${p.cases.map(c => `
            case ${c.id}:
                {
                    const initial = ${c.initial};
                    final = (() => {
                        ${c.logic}
                    })();
                }
                break;`).join('')}
        }

        if(errorDiv) errorDiv.style.display = 'none';
        finalSpan.innerText = JSON.stringify(final, null, 2);
        resContainer.style.display = 'block';
        
        // Desactivar
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
        if(errorDiv) {
            errorDiv.innerText = e;
            errorDiv.style.display = 'block';
        }
    }
};`;

    fs.writeFileSync(path.join(dir, 'index.html'), htmlCode);
    fs.writeFileSync(path.join(dir, 'script.js'), scriptCode);
});
