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
                        const copy = [...initial]; copy.splice(1, 0, inputs[0]); return copy;
                    })();
                }
                break;
            case 3:
                {
                    const initial = ["Uno", "Dos", "Tres"];
                    final = (() => {
                        const copy = [...initial]; copy.splice(1, 2, inputs[0], inputs[1]); return copy;
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
        btn.classList.remove('btn-danger');
        
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