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
                    const initial = [5, 12, 8, 130, 44];
                    final = (() => {
                        return initial.filter(n => n > 10);
                    })();
                }
                break;
            case 2:
                {
                    const initial = ["sol", "computadora", "casa", "javascript"];
                    final = (() => {
                        return initial.filter(p => p.length > 5);
                    })();
                }
                break;
            case 3:
                {
                    const initial = [{n: "Fede", activo: true}, {n: "Gaston", activo: false}];
                    final = (() => {
                        return initial.filter(u => u.activo);
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
        btn.classList.remove('btn-success');
        
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