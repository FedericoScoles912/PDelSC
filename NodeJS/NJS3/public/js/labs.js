// DOM Labs Logic - Modules 1-6
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Module 1: Basic DOM Interaction ---
    const mod1Output = document.getElementById('module1-output');
    const btnInjectH1 = document.getElementById('btn-inject-h1');
    const btnUpdateH1 = document.getElementById('btn-update-h1');
    const btnChangeColor = document.getElementById('btn-change-color');
    const btnAppendImg = document.getElementById('btn-append-img');
    const btnSwapImg = document.getElementById('btn-swap-img');
    const btnToggleSize = document.getElementById('btn-toggle-size');

    btnInjectH1.addEventListener('click', () => {
        const h1 = document.createElement('h1');
        h1.textContent = 'Hola DOM';
        h1.id = 'mod1-h1';
        mod1Output.innerHTML = ''; // Clear output
        mod1Output.appendChild(h1);
    });

    btnUpdateH1.addEventListener('click', () => {
        const h1 = document.getElementById('mod1-h1');
        if (h1) h1.textContent = 'Chau DOM';
    });

    btnChangeColor.addEventListener('click', () => {
        const h1 = document.getElementById('mod1-h1');
        if (h1) h1.style.color = h1.style.color === 'red' ? 'blue' : 'red';
    });

    btnAppendImg.addEventListener('click', () => {
        const img = document.createElement('img');
        img.src = 'https://picsum.photos/200/200?random=10';
        img.id = 'mod1-img';
        img.className = 'img-fluid rounded mt-2 shadow-sm';
        img.width = 200;
        img.height = 200;
        mod1Output.appendChild(img);
    });

    btnSwapImg.addEventListener('click', () => {
        const img = document.getElementById('mod1-img');
        if (img) img.src = `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 100)}`;
    });

    btnToggleSize.addEventListener('click', () => {
        const img = document.getElementById('mod1-img');
        if (img) {
            const currentWidth = img.getAttribute('width');
            const newSize = currentWidth === '200' ? '300' : '200';
            img.setAttribute('width', newSize);
            img.setAttribute('height', newSize);
        }
    });


    // --- Module 2: Multi-Component Event Handling ---
    const feedback = document.getElementById('event-feedback');
    const components = {
        'event-card': 'mouseover',
        'event-alert': 'dblclick',
        'event-btn': 'contextmenu',
        'event-badge': 'click',
        'event-list': 'mouseout'
    };

    Object.entries(components).forEach(([id, eventType]) => {
        const el = document.getElementById(id);
        el.addEventListener(eventType, (e) => {
            if (eventType === 'contextmenu') e.preventDefault();
            feedback.innerHTML = `<span class="badge bg-dark">Evento detectado: ${eventType} en ${id}</span>`;
            el.classList.add('border-primary', 'border-3');
            setTimeout(() => el.classList.remove('border-primary', 'border-3'), 500);
        });
    });


    // --- Module 3: DOM Tree Traversal ---
    const btnScan = document.getElementById('btn-scan-children');
    const childCountSpan = document.getElementById('child-count');
    const traversalContainer = document.getElementById('traversal-container');

    btnScan.addEventListener('click', () => {
        const count = traversalContainer.childNodes.length;
        childCountSpan.textContent = count;
    });


    // --- Module 4: Attribute Manipulation & Logging ---
    const btnModify = document.getElementById('btn-modify-anchors');
    const logList = document.getElementById('log-list');

    btnModify.addEventListener('click', () => {
        const anchors = document.querySelectorAll('#anchor-container a');
        anchors.forEach((a, index) => {
            const oldHref = a.getAttribute('href');
            const oldTarget = a.getAttribute('target');
            const newHref = `https://example.com/page${index + 1}`;
            const newTarget = '_self';

            a.setAttribute('href', newHref);
            a.setAttribute('target', newTarget);
            a.textContent = `Enlace Modificado ${index + 1}`;

            const logItemHref = document.createElement('li');
            logItemHref.textContent = `[Enlace ${index+1}] Modified attribute href from ${oldHref} to ${newHref}`;
            logList.prepend(logItemHref);

            const logItemTarget = document.createElement('li');
            logItemTarget.textContent = `[Enlace ${index+1}] Modified attribute target from ${oldTarget} to ${newTarget}`;
            logList.prepend(logItemTarget);
        });
    });


    // --- Module 5: InnerHTML Injection ---
    const btnTable = document.getElementById('btn-inject-table');
    const btnPricing = document.getElementById('btn-inject-pricing');
    const btnClear = document.getElementById('btn-clear-inner');
    const injectContainer = document.getElementById('dynamic-injection-container');

    btnTable.addEventListener('click', () => {
        injectContainer.innerHTML = `
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr><th>#</th><th>Producto</th><th>Precio</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>Laptop Pro</td><td>$1200</td></tr>
                    <tr><td>2</td><td>Monitor 4K</td><td>$400</td></tr>
                    <tr><td>3</td><td>Teclado Mecánico</td><td>$150</td></tr>
                </tbody>
            </table>
        `;
    });

    btnPricing.addEventListener('click', () => {
        injectContainer.innerHTML = `
            <div class="row g-3">
                <div class="col-md-6">
                    <div class="card text-center shadow-sm">
                        <div class="card-header py-3"><h4>Básico</h4></div>
                        <div class="card-body">
                            <h1 class="card-title">$0 <small class="text-muted">/ mes</small></h1>
                            <ul class="list-unstyled mt-3 mb-4">
                                <li>10 usuarios</li>
                                <li>2 GB de almacenamiento</li>
                                <li>Soporte básico</li>
                            </ul>
                            <button class="btn btn-outline-primary w-100">Suscribirse</button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card text-center shadow-sm border-primary">
                        <div class="card-header py-3 bg-primary text-white"><h4>Pro</h4></div>
                        <div class="card-body">
                            <h1 class="card-title">$29 <small class="text-white">/ mes</small></h1>
                            <ul class="list-unstyled mt-3 mb-4">
                                <li>Ilimitados usuarios</li>
                                <li>50 GB de almacenamiento</li>
                                <li>Soporte prioritario</li>
                            </ul>
                            <button class="btn btn-primary w-100">Suscribirse</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    btnClear.addEventListener('click', () => {
        injectContainer.innerHTML = '<p class="text-muted italic">Contenedor limpio. Inyecta algo nuevo.</p>';
    });


    // --- Module 6: Dynamic Form Processing ---
    const regForm = document.getElementById('registration-form');
    const profileContainer = document.getElementById('profile-card-container');
    const errorContainer = document.getElementById('form-errors');

    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        errorContainer.innerHTML = ''; // Clear previous errors

        const name = document.getElementById('inputName').value.trim();
        const email = document.getElementById('inputEmail').value.trim();
        const age = document.getElementById('inputAge').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const interest = document.getElementById('inputInterest').value;
        const newsletter = document.getElementById('gridCheck').checked ? 'Sí' : 'No';

        // Validations
        const errors = [];
        
        // Name: No numbers and at least 3 characters
        if (name.length < 3) {
            errors.push('El nombre debe tener al menos 3 letras.');
        }
        if (/\d/.test(name)) {
            errors.push('El nombre no puede contener números.');
        }

        // Email: Must contain "@" and ".com"
        if (!email.includes('@') || !email.includes('.com')) {
            errors.push('El email debe contener "@" y ".com" sin excepción.');
        }

        if (errors.length > 0) {
            errorContainer.innerHTML = `
                <div class="alert alert-danger">
                    <ul class="mb-0">
                        ${errors.map(err => `<li>${err}</li>`).join('')}
                    </ul>
                </div>
            `;
            return;
        }

        profileContainer.innerHTML = `
            <div class="card profile-card shadow">
                <div class="card-header bg-success text-white fw-bold">Perfil de Usuario</div>
                <div class="card-body">
                    <h5 class="card-title">${name}</h5>
                    <p class="card-text"><strong>Email:</strong> ${email}</p>
                    <p class="card-text"><strong>Edad:</strong> ${age}</p>
                    <p class="card-text"><strong>Género:</strong> ${gender}</p>
                    <p class="card-text"><strong>Interés:</strong> ${interest}</p>
                    <p class="card-text"><strong>Newsletter:</strong> ${newsletter}</p>
                    <button class="btn btn-sm btn-outline-secondary mt-2 w-100" onclick="location.reload()">Nuevo Registro</button>
                </div>
            </div>
        `;
    });
});
