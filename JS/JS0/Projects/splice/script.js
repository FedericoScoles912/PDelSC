const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);

    let final;
    switch(caseId) {
        
        case 1:
            {
                const initial = ["A", "B", "C", "D"];
                final = (() => {
                    const copy = [...initial]; copy.splice(1, 2); return copy;
                })();
            }
            break;
        case 2:
            {
                const initial = ["Fede", "Lucas"];
                final = (() => {
                    const copy = [...initial]; copy.splice(1, 0, "Gaston"); return copy;
                })();
            }
            break;
        case 3:
            {
                const initial = ["Cero Tres", "Cero", "Tres"];
                final = (() => {
                    const copy = [...initial]; copy.splice(1, 2, "Cuatro Cinco", "Seis"); return copy;
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