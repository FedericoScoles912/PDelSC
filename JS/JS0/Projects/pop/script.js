const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);

    let final;
    switch(caseId) {
        
        case 1:
            {
                const initial = ["Perro", "Gato", "Loro"];
                final = (() => {
                    const copy = [...initial]; copy.pop(); return copy;
                })();
            }
            break;
        case 2:
            {
                const initial = ["Pan", "Leche", "Agua"];
                final = (() => {
                    const copy = [...initial]; const eliminado = copy.pop(); return { resultado: copy, eliminado };
                })();
            }
            break;
        case 3:
            {
                const initial = [1, 2, 3, 4, 5];
                final = (() => {
                    const copy = [...initial]; while(copy.length > 0) { copy.pop(); } return copy;
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