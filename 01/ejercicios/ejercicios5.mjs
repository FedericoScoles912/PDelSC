import { suma, resta, multipliclica, divide } from './calculos.js';


const css = `
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f7f6;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
    }
    .container {
        background-color: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        text-align: center;
    }
    h1 {
        color: #333;
        margin-bottom: 1.5rem;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }
    th, td {
        padding: 12px 20px;
        border: 1px solid #ddd;
        text-align: left;
    }
    th {
        background-color: #4CAF50;
        color: white;
        font-weight: bold;
    }
    tr:nth-child(even) {
        background-color: #f9f9f9;
    }
    tr:hover {
        background-color: #f1f1f1;
    }
    .resultado {
        font-weight: bold;
        color: #2c3e50;
    }
`;

const html = `
    <div class="container">
        <h1>Tabla de Resultados</h1>
        <table id="tablaResultados">
            <thead>
                <tr>
                    <th>Operación</th>
                    <th>Valores</th>
                    <th>Resultado</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Suma</td><td>4 + 5</td><td class="resultado">${suma(4, 5)}</td></tr>
                <tr><td>Resta</td><td>3 - 6</td><td class="resultado">${resta(3, 6)}</td></tr>
                <tr><td>Multiplicación</td><td>2 * 7</td><td class="resultado">${multipliclica(2, 7)}</td></tr>
                <tr><td>División</td><td>20 / 4</td><td class="resultado">${divide(20, 4)}</td></tr>
            </tbody>
        </table>
    </div>
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = css;
document.head.appendChild(styleSheet);
document.body.innerHTML = html;
