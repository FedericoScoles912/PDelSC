const ejecutar = (caseId) => {
    const btn = document.getElementById('btn-' + caseId);
    const resContainer = document.getElementById('res-container-' + caseId);
    const finalSpan = document.getElementById('final-' + caseId);

    let final;
    let inputs;

    switch(caseId) {
        case 1: // Frutas
            {
                const initial = [];
                const f1 = document.getElementById('input-1-1').value || "Fruta1";
                const f2 = document.getElementById('input-1-2').value || "Fruta2";
                const f3 = document.getElementById('input-1-3').value || "Fruta3";
                
                const copy = [...initial];
                copy.push(f1, f2, f3);
                final = copy;

                // Desactivar inputs
                document.getElementById('input-1-1').disabled = true;
                document.getElementById('input-1-2').disabled = true;
                document.getElementById('input-1-3').disabled = true;
            }
            break;
        case 2: // Amigos
            {
                const initial = ["Fede", "Gaston"];
                const a1 = document.getElementById('input-2-1').value || "Amigo1";
                const a2 = document.getElementById('input-2-2').value || "Amigo2";
                const a3 = document.getElementById('input-2-3').value || "Amigo3";

                const copy = [...initial];
                copy.push(a1, a2, a3);
                final = copy;

                // Desactivar inputs
                document.getElementById('input-2-1').disabled = true;
                document.getElementById('input-2-2').disabled = true;
                document.getElementById('input-2-3').disabled = true;
            }
            break;
        case 3: // Números (Validación)
            {
                const initial = [10, 20, 30];
                const inputNum = document.getElementById('input-3');
                const errorMsg = document.getElementById('error-3');
                const val = parseInt(inputNum.value);
                const lastNum = initial[initial.length - 1];

                if (isNaN(val) || val <= lastNum) {
                    // Mostrar error y no desactivar nada
                    errorMsg.style.display = 'block';
                    inputNum.classList.add('is-invalid');
                    return; // Salir sin ejecutar transformación final
                }

                // Si es válido
                errorMsg.style.display = 'none';
                inputNum.classList.remove('is-invalid');
                inputNum.classList.add('is-valid');
                
                const copy = [...initial];
                copy.push(val);
                final = copy;

                // Desactivar input
                inputNum.disabled = true;
            }
            break;
    }

    finalSpan.innerText = JSON.stringify(final, null, 2);
    resContainer.style.display = 'block';
    
    // Desactivar botón
    btn.disabled = true;
    btn.innerText = "Ejecutado";
    btn.classList.add('btn-secondary');
    btn.classList.remove('btn-primary');

    console.log("Caso " + caseId + " ejecutado:", final);
};
