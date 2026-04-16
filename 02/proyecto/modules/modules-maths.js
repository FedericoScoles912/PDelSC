export function sumar(a, b) {
    return a + b;
}
export function restar(a, b) {
    return a - b;
}
export function multiplicar(a, b) {
    return a * b;
}
export function dividir(a, b) {
    return a / b;
}

export const renderCalculator = () => `
    <section class="card shadow-sm border-0 h-100 calculator-widget">
        <div class="card-body p-4">
            <p class="section-kicker mb-2">Calculadora</p>
            <div class="calculator-display bg-light rounded-3 p-3 mb-3 text-end">
                <p class="h3 mb-0 fw-bold" id="calc-display">0</p>
            </div>
            <div class="row g-2">
                <div class="col-3"><button class="btn btn-outline-secondary w-100 py-3" onclick="clearDisplay()">C</button></div>
                <div class="col-3"><button class="btn btn-outline-secondary w-100 py-3" onclick="appendToDisplay('/')">/</button></div>
                <div class="col-3"><button class="btn btn-outline-secondary w-100 py-3" onclick="appendToDisplay('*')">*</button></div>
                <div class="col-3"><button class="btn btn-outline-danger w-100 py-3" onclick="backspace()">←</button></div>
                
                <div class="col-3"><button class="btn btn-light w-100 py-3" onclick="appendToDisplay('7')">7</button></div>
                <div class="col-3"><button class="btn btn-light w-100 py-3" onclick="appendToDisplay('8')">8</button></div>
                <div class="col-3"><button class="btn btn-light w-100 py-3" onclick="appendToDisplay('9')">9</button></div>
                <div class="col-3"><button class="btn btn-outline-secondary w-100 py-3" onclick="appendToDisplay('-')">-</button></div>
                
                <div class="col-3"><button class="btn btn-light w-100 py-3" onclick="appendToDisplay('4')">4</button></div>
                <div class="col-3"><button class="btn btn-light w-100 py-3" onclick="appendToDisplay('5')">5</button></div>
                <div class="col-3"><button class="btn btn-light w-100 py-3" onclick="appendToDisplay('6')">6</button></div>
                <div class="col-3"><button class="btn btn-outline-secondary w-100 py-3" onclick="appendToDisplay('+')">+</button></div>
                
                <div class="col-3"><button class="btn btn-light w-100 py-3" onclick="appendToDisplay('1')">1</button></div>
                <div class="col-3"><button class="btn btn-light w-100 py-3" onclick="appendToDisplay('2')">2</button></div>
                <div class="col-3"><button class="btn btn-light w-100 py-3" onclick="appendToDisplay('3')">3</button></div>
                <div class="col-6"><button class="btn btn-light w-100 py-3" onclick="appendToDisplay('0')">0</button></div>
                <div class="col-3"><button class="btn btn-light w-100 py-3" onclick="appendToDisplay('.')">.</button></div>
                <div class="col-3"><button class="btn btn-primary w-100 py-3" onclick="calculate()">=</button></div>
            </div>
        </div>
        <script>
            function appendToDisplay(val) {
                const display = document.getElementById('calc-display');
                if (display.innerText === '0' && val !== '.') {
                    display.innerText = val;
                } else {
                    display.innerText += val;
                }
            }
            function clearDisplay() {
                document.getElementById('calc-display').innerText = '0';
            }
            function backspace() {
                const display = document.getElementById('calc-display');
                if (display.innerText.length > 1) {
                    display.innerText = display.innerText.slice(0, -1);
                } else {
                    display.innerText = '0';
                }
            }
            function calculate() {
                const display = document.getElementById('calc-display');
                try {
                    // Use Function instead of eval for a bit more safety, though still not great for production
                    display.innerText = new Function('return ' + display.innerText)();
                } catch (e) {
                    display.innerText = 'Error';
                    setTimeout(clearDisplay, 1500);
                }
            }
        </script>
    </section>
`;
