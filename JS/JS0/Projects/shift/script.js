const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);

    let final;
    switch(caseId) {
        
        case 1:
            {
                const initial = [10, 20, 30];
                final = (() => {
                    const copy = [...initial]; copy.shift(); return copy;
                })();
            }
            break;
        case 2:
            {
                const initial = ["Hola", "Cómo va?", "Todo bien"];
                final = (() => {
                    const copy = [...initial]; copy.shift(); return copy;
                })();
            }
            break;
        case 3:
            {
                const initial = ["Cliente A", "Cliente B", "Cliente C"];
                final = (() => {
                    const copy = [...initial]; const atendido = copy.shift(); return { restante: copy, atendido };
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