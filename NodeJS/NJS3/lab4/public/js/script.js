document.addEventListener('DOMContentLoaded', () => {
    const logList = document.getElementById('log-list');
    const dynamicContainer = document.getElementById('dynamic-elements-container');
    const mainLink = document.getElementById('main-link');

    // Botones
    const btnChangeColor = document.getElementById('btn-change-color');
    const btnAddDiv = document.getElementById('btn-add-div');
    const btnAddBtn = document.getElementById('btn-add-btn');
    const btnChangeHref = document.getElementById('btn-change-href');
    const btnAddImg = document.getElementById('btn-add-img');

    // Función para Cambiar Color (del propio botón)
    btnChangeColor.addEventListener('click', () => {
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const oldColor = btnChangeColor.style.backgroundColor || '#6366f1';
        btnChangeColor.style.backgroundColor = randomColor;
        btnChangeColor.style.borderColor = randomColor;
        addLog(`Cambiado color del botón: ${oldColor} -> ${randomColor}`);
    });

    // Función para Agregar Div
    btnAddDiv.addEventListener('click', () => {
        const newDiv = document.createElement('div');
        newDiv.className = 'p-3 border rounded bg-white shadow-sm w-100 text-center';
        newDiv.textContent = `Div agregado el ${new Date().toLocaleTimeString()}`;
        dynamicContainer.appendChild(newDiv);
        addLog('Agregado nuevo elemento <div>');
    });

    // Función para Agregar Botón
    btnAddBtn.addEventListener('click', () => {
        const newBtn = document.createElement('button');
        newBtn.className = 'btn btn-secondary btn-sm rounded-pill px-3';
        newBtn.textContent = 'Botón Misterioso';
        newBtn.onclick = () => window.location.href = '/misterioso.html';
        dynamicContainer.appendChild(newBtn);
        addLog('Agregado nuevo botón misterioso');
    });

    // Función para Cambiar Href
    btnChangeHref.addEventListener('click', () => {
        const oldHref = mainLink.getAttribute('href');
        const newHref = oldHref.includes('google') ? 'https://github.com' : 'https://google.com';
        mainLink.setAttribute('href', newHref);
        mainLink.textContent = newHref.includes('github') ? 'GitHub (Modificado)' : 'Google Principal';
        addLog(`Cambiado href: ${oldHref} -> ${newHref}`);
    });

    // Función para Agregar Img
    btnAddImg.addEventListener('click', () => {
        const newImg = document.createElement('img');
        const randomId = Math.floor(Math.random() * 1000);
        newImg.src = `https://picsum.photos/200/100?random=${randomId}`;
        newImg.className = 'rounded shadow-sm img-fluid';
        newImg.alt = 'Imagen dinámica';
        dynamicContainer.appendChild(newImg);
        addLog(`Agregada nueva imagen (ID: ${randomId})`);
    });

    function addLog(message) {
        const li = document.createElement('li');
        li.textContent = `> ${message}`;
        logList.prepend(li);
    }
});
