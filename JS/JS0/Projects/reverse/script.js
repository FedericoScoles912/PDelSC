const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);

    let final;
    switch(caseId) {
        
        case 1:
            {
                const initial = ["A", "B", "C"];
                final = (() => {
                    return [...initial].reverse();
                })();
            }
            break;
        case 2:
            {
                const initial = [1, 2, 3];
                final = (() => {
                    return [...initial].reverse();
                })();
            }
            break;
        case 3:
            {
                const initial = "JavaScript";
                final = (() => {
                    return initial.split("").reverse().join("");
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
    btn.classList.remove('btn-warning');

    console.log("Caso " + caseId + " ejecutado:", final);
};