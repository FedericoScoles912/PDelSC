const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);

    let final;
    switch(caseId) {
        
        case 1:
            {
                const initial = [1, 2, 3, 4];
                final = (() => {
                    return initial.reduce((a, b) => a + b, 0);
                })();
            }
            break;
        case 2:
            {
                const initial = [1, 2, 3, 4];
                final = (() => {
                    return initial.reduce((a, b) => a * b, 1);
                })();
            }
            break;
        case 3:
            {
                const initial = [{p: 100}, {p: 200}, {p: 300}];
                final = (() => {
                    return initial.reduce((a, b) => a + b.p, 0);
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
    btn.classList.remove('btn-danger');

    console.log("Caso " + caseId + " ejecutado:", final);
};