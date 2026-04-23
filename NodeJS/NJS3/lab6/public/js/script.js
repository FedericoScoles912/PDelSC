document.addEventListener('DOMContentLoaded', () => {
    const regForm = document.getElementById('registration-form');
    const profileContainer = document.getElementById('profile-card-container');
    const errorContainer = document.getElementById('form-errors');

    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        errorContainer.innerHTML = '';

        const name = document.getElementById('inputName').value.trim();
        const email = document.getElementById('inputEmail').value.trim();
        const age = document.getElementById('inputAge').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const favoriteModule = document.getElementById('inputFavoriteModule').value;
        const updatesAccepted = document.getElementById('checkUpdates').checked;

        const errors = [];
        if (name.length < 3) errors.push('Mínimo 3 letras.');
        if (/\d/.test(name)) errors.push('Sin números en el nombre.');
        if (age < 18) errors.push('Mínimo 18 años.');
        if (!gender) errors.push('Seleccione su género.');
        if (!email.includes('@') || !email.includes('.com')) errors.push('Mail invalidado.');
        if (!favoriteModule) errors.push('Selecciona qué módulo te gustó más.');
        if (!updatesAccepted) errors.push('Debes aceptar recibir actualizaciones.');

        if (errors.length > 0) {
            errorContainer.innerHTML = `<div class="alert alert-danger p-2 small"><ul class="mb-0">${errors.map(e => `<li>${e}</li>`).join('')}</ul></div>`;
            return;
        }

        profileContainer.innerHTML = `
            <div class="card shadow-sm w-100">
                <div class="card-header bg-success text-white">Perfil</div>
                <div class="card-body">
                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Edad:</strong> ${age}</p>
                    <p><strong>Género:</strong> ${gender}</p>
                    <p><strong>Módulo Favorito:</strong> ${favoriteModule}</p>
                    <p><strong>Actualizaciones:</strong> ${updatesAccepted ? 'Aceptadas' : 'No aceptadas'}</p>
                    <button class="btn btn-outline-secondary btn-sm w-100" onclick="location.reload()">Nuevo</button>
                </div>
            </div>
        `;
    });
});
