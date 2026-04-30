const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);

    let final;
    switch(caseId) {
        
        case 1:
            {
                const initial = [1, 2, 3];
                final = (() => {
                    return initial.map(n => n * 3);
                })();
            }
            break;
        case 2:
            {
                const initial = ["fede", "gaston"];
                final = (() => {
                    return initial.map(n => n.toUpperCase());
                })();
            }
            break;
        case 3:
            {
                const initial = [100, 200, 300];
                final = (() => {
                    return initial.map(p => Number((p * 1.21).toFixed(2)));
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
    btn.classList.remove('btn-primary');

    console.log("Caso " + caseId + " ejecutado:", final);
};