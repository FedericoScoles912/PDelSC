const ejecutar = () => {
    const input = document.getElementById('inputMessage');
    const btn = document.getElementById('btn-decode');
    const resContainer = document.getElementById('res-container');
    const finalSpan = document.getElementById('final');
    const errorDiv = document.getElementById('error-msg');
    
    const text = input.value.trim();
    
    if (!text) {
        errorDiv.innerText = "Por favor, ingresa un mensaje.";
        errorDiv.style.display = 'block';
        return;
    }

    // Validaciones Atómicas
    const validate = (str) => {
        let open = 0;
        for (let char of str) {
            if (char === '(') {
                open++;
                if (open > 1) return "No se permiten paréntesis anidados.";
            } else if (char === ')') {
                open--;
                if (open < 0) return "Paréntesis de cierre sin apertura.";
            }
        }
        return open === 0 ? null : "Paréntesis no balanceados.";
    };

    const error = validate(text);
    if (error) {
        errorDiv.innerText = error;
        errorDiv.style.display = 'block';
        input.classList.add('is-invalid');
        return;
    }

    // Lógica de Decodificación Atomizada
    const reverse = (s) => s.split('').reverse().join('');
    
    const decode = (str) => {
        return str.replace(/\(([^()]*)\)/g, (match, content) => reverse(content));
    };

    const result = decode(text);

    // Actualizar UI
    errorDiv.style.display = 'none';
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    
    finalSpan.innerText = result;
    resContainer.style.display = 'block';
    
    // Desactivar tras uso exitoso
    btn.disabled = true;
    btn.innerText = "Decodificado";
    btn.classList.replace('btn-primary', 'btn-secondary');
    input.disabled = true;

    console.log("Mensaje decodificado:", result);
};
