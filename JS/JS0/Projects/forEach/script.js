
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
            
            case 1:
                {
                    // Definir el array inicial (si existe)
                    const initial = ["Fede", "Gaston"];
                    // Ejecutar la lógica del caso en una IIFE
                    final = (() => {
                        const res = []; initial.forEach(n => res.push(inputs[0] + " " + n)); return res;
                    })();
                }
                break;
            case 2:
                {
                    // Definir el array inicial (si existe)
                    const initial = [1, 2, 3];
                    // Ejecutar la lógica del caso en una IIFE
                    final = (() => {
                        const res = []; initial.forEach(n => res.push(n * 2)); return res;
                    })();
                }
                break;
            case 3:
                {
                    // Definir el array inicial (si existe)
                    const initial = [{nombre: "Fede", edad: 25}, {nombre: "Gaston", edad: 30}];
                    // Ejecutar la lógica del caso en una IIFE
                    final = (() => {
                        const res = []; initial.forEach(o => res.push(o.nombre + " tiene " + o.edad + " años")); return res;
                    })();
                }
                break;
        }

        // Si no hay errores, ocultar el mensaje de error y mostrar el resultado
        if(errorDiv) errorDiv.style.display = 'none';
        finalSpan.innerText = JSON.stringify(final, null, 2);
        resContainer.style.display = 'block';
        
        // Desactivar el botón y inputs después de ejecutar
        btn.disabled = true;
        btn.innerText = "Ejecutado";
        btn.classList.add('btn-secondary');
        btn.classList.remove('btn-dark');
        
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
};