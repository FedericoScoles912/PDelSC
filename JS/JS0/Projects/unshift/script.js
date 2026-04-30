const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);
    const errorDiv = document.getElementById('error-' + caseId);

    // Obtener inputs
    const inputs = [];
    let i = 0;
    while(document.getElementById('input-' + caseId + '-' + i)) {
        const val = document.getElementById('input-' + caseId + '-' + i).value;
        if(!val) {
            if(errorDiv) {
                errorDiv.innerText = "Completa todos los campos.";
                errorDiv.style.display = 'block';
            }
            return;
        }
        inputs.push(val);
        i++;
    }

    let final;
    try {
        switch(caseId) {
            
            case 1:
                {
                    const initial = [];
                    final = (() => {
                        const copy = [...initial]; copy.unshift(inputs[0], inputs[1], inputs[2]); return copy;
                    })();
                }
                break;
            case 2:
                {
                    const initial = ["Tarea 1", "Tarea 2"];
                    final = (() => {
                        const copy = [...initial]; copy.unshift(inputs[0]); return copy;
                    })();
                }
                break;
            case 3:
                {
                    const initial = ["User1", "User2"];
                    final = (() => {
                        const copy = [...initial]; copy.unshift(inputs[0]); return copy;
                    })();
                }
                break;
        }

        if(errorDiv) errorDiv.style.display = 'none';
        finalSpan.innerText = JSON.stringify(final, null, 2);
        resContainer.style.display = 'block';
        
        // Desactivar
        btn.disabled = true;
        btn.innerText = "Ejecutado";
        btn.classList.add('btn-secondary');
        btn.classList.remove('btn-info');
        
        let j = 0;
        while(document.getElementById('input-' + caseId + '-' + j)) {
            document.getElementById('input-' + caseId + '-' + j).disabled = true;
            j++;
        }

    } catch (e) {
        if(errorDiv) {
            errorDiv.innerText = e;
            errorDiv.style.display = 'block';
        }
    }
};