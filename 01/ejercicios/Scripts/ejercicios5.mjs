import http from 'http';
import { suma, resta, multipliclica, divide } from './calculos.js';

// Datos de las operaciones
const operaciones = [
    { Operación: "Suma", Valores: "5 + 3", Resultado: suma(5, 3) },
    { Operación: "Resta", Valores: "8 - 6", Resultado: resta(8, 6) },
    { Operación: "Multiplicación", Valores: "3 * 11", Resultado: multipliclica(3, 11) },
    { Operación: "División", Valores: "30 / 5", Resultado: divide(30, 5) }
];

// Generar el HTML con estilos directamente desde el servidor
const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ejercicio 5 - Resultados</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background-color: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; }
        h1 { color: #333; margin-bottom: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
        th, td { padding: 15px; border: 1px solid #eee; text-align: left; }
        th { background-color: #4CAF50; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        tr:hover { background-color: #f1f1f1; }
        .res { font-weight: bold; color: #2e7d32; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Tabla de Resultados</h1>
        <table>
            <thead>
                <tr><th>Operación</th><th>Valores</th><th>Resultado</th></tr>
            </thead>
            <tbody>
                ${operaciones.map(op => `
                    <tr>
                        <td>${op.Operación}</td>
                        <td>${op.Valores}</td>
                        <td class="res">${op.Resultado}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>
`;

// Crear un servidor que responda con el HTML generado
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlContent);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
