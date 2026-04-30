const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);

    let final;
    switch(caseId) {
        
        case 1:
            {
                const initial = [40, 100, 1, 5];
                final = (() => {
                    return [...initial].sort((a, b) => a - b);
                })();
            }
            break;
        case 2:
            {
                const initial = ["Pera", "Manzana", "Ananá"];
                final = (() => {
                    return [...initial].sort();
                })();
            }
            break;
        case 3:
            {
                const initial = [{n: "Z", e: 30}, {n: "A", e: 20}];
                final = (() => {
                    return [...initial].sort((a, b) => a.e - b.e);
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
    btn.classList.remove('btn-info');

    console.log("Caso " + caseId + " ejecutado:", final);
};