document.addEventListener('DOMContentLoaded', () => {
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
        mod1Output.innerHTML = ''; 
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
});
