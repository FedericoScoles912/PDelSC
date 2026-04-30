const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);

    let final;
    switch(caseId) {
        
        case 1:
            {
                const initial = [];
                final = (() => {
                    const copy = [...initial]; copy.unshift("Rojo", "Verde", "Azul"); return copy;
                })();
            }
            break;
        case 2:
            {
                const initial = ["Limpiar la casa", "Hacer la comida"];
                final = (() => {
                    const copy = [...initial]; copy.unshift("HACER LA PLANTILLA CON NORMAS APA PARA ESTANGA"); return copy;
                })();
            }
            break;
        case 3:
            {
                const initial = ["User1", "User2"];
                final = (() => {
                    const copy = [...initial]; copy.unshift("Nuevo Usuario"); return copy;
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