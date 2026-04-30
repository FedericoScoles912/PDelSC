const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);

    let final;
    switch(caseId) {
        
        case 1:
            {
                const initial = [5, 12, 8, 130, 44];
                final = (() => {
                    return initial.filter(n => n > 10);
                })();
            }
            break;
        case 2:
            {
                const initial = ["sol", "computadora", "casa", "javascript"];
                final = (() => {
                    return initial.filter(p => p.length > 5);
                })();
            }
            break;
        case 3:
            {
                const initial = [{n: "Fede", activo: true}, {n: "Gaston", activo: false}];
                final = (() => {
                    return initial.filter(u => u.activo);
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
    btn.classList.remove('btn-success');

    console.log("Caso " + caseId + " ejecutado:", final);
};