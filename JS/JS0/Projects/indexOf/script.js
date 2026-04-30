const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);

    let final;
    switch(caseId) {
        
        case 1:
            {
                const initial = ["gato", "perro", "pájaro"];
                final = (() => {
                    return initial.indexOf("perro");
                })();
            }
            break;
        case 2:
            {
                const initial = [10, 20, 50, 100];
                final = (() => {
                    return initial.indexOf(50);
                })();
            }
            break;
        case 3:
            {
                const initial = ["Paris", "Londres", "Madrid"];
                final = (() => {
                    const idx = initial.indexOf("Madrid"); return idx !== -1 ? idx : "No está";
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