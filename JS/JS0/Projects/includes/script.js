const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);

    let final;
    switch(caseId) {
        
        case 1:
            {
                const initial = ["user", "admin", "guest"];
                final = (() => {
                    return initial.includes("admin");
                })();
            }
            break;
        case 2:
            {
                const initial = ["rojo", "azul", "amarillo"];
                final = (() => {
                    return initial.includes("verde");
                })();
            }
            break;
        case 3:
            {
                const initial = [1, 2, 3];
                final = (() => {
                    const num = 4; const copy = [...initial]; if(!copy.includes(num)) copy.push(num); return copy;
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