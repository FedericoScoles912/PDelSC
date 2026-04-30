const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);

    let final;
    switch(caseId) {
        
        case 1:
            {
                const initial = ["Fede", "Gaston"];
                final = (() => {
                    const res = []; initial.forEach(n => res.push("Hola " + n)); return res;
                })();
            }
            break;
        case 2:
            {
                const initial = [1, 2, 3];
                final = (() => {
                    const res = []; initial.forEach(n => res.push(n * 2)); return res;
                })();
            }
            break;
        case 3:
            {
                const initial = [{nombre: "Fede", edad: 25}, {nombre: "Gaston", edad: 30}];
                final = (() => {
                    const res = []; initial.forEach(o => res.push(o.nombre + " tiene " + o.edad + " años")); return res;
                })();
            }
            break;
    }

    finalSpan.innerText = JSON.stringify(final, null, 2);
    resContainer.style.display = 'block';
    
    // Desactivar botón tras un solo uso
    btn.disabled = true;
    btn.innerText = "Ejecutado";
    btn.classList.add('btn-secondary');
    btn.classList.remove('btn-dark');

    console.log("Caso " + caseId + " ejecutado:", final);
};