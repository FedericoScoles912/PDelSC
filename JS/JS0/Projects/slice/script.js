const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);

    let final;
    switch(caseId) {
        
        case 1:
            {
                const initial = [10, 20, 30, 40, 50];
                final = (() => {
                    return initial.slice(0, 3);
                })();
            }
            break;
        case 2:
            {
                const initial = ["Peli1", "Peli2", "Peli3", "Peli4", "Peli5"];
                final = (() => {
                    return initial.slice(2, 4);
                })();
            }
            break;
        case 3:
            {
                const initial = ["A", "B", "C", "D", "E"];
                final = (() => {
                    return initial.slice(-3);
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
    btn.classList.remove('btn-secondary');

    console.log("Caso " + caseId + " ejecutado:", final);
};