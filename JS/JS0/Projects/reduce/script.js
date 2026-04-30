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
                    const initial = [1, 2, 3, 4];
                    final = (() => {
                        return initial.reduce((a, b) => a + b, 0);
                    })();
                }
                break;
            case 2:
                {
                    const initial = [1, 2, 3, 4];
                    final = (() => {
                        return initial.reduce((a, b) => a * b, 1);
                    })();
                }
                break;
            case 3:
                {
                    const initial = [{p: 100}, {p: 200}, {p: 300}];
                    final = (() => {
                        return initial.reduce((a, b) => a + b.p, 0);
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