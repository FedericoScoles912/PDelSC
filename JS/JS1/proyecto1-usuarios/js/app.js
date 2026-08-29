const App = {
    users: [],

    init() {
        Storage.setTheme(Storage.getTheme());
        this.initThemeToggle();
        this.loadData();
        this.initForm();
        this.renderUsers();
    },

    initThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                Storage.toggleTheme();
            });
        }
    },

    loadData() {
        this.users = Storage.load('users-proyecto1', []);
    },

    initForm() {
        const form = document.getElementById('userForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUserForm(form);
            });
        }
    },

    handleUserForm(form) {
        const rules = {
            nombre: { required: true, minLength: 2, maxLength: 50, letters: true },
            emailUsuario: { required: true, minLength: 2 },
            emailProveedor: { required: true, minLength: 2 },
            emailDominio: { required: true },
            edad: { required: true, integer: true }
        };

        if (!Validations.validateForm(form, rules)) {
            UI.showAlert('alerts-proyecto1', 'Por favor, corrija los errores del formulario', 'danger');
            return;
        }

        const nombre1 = Forms.getElementById(form, 'nombre');
        const emailUsuario = document.getElementById('emailUsuario').value;
        const emailProveedor = document.getElementById('emailProveedor').value;
        const emailDominio = document.getElementById('emailDominio').value;
        const emailCompleto = `${emailUsuario}@${emailProveedor}.${emailDominio}`;
        const data3 = Forms.getFormData(form);

        const user = {
            id: UI.generateId(),
            nombre: nombre1,
            email: emailCompleto,
            edad: parseInt(data3.edad),
            fecha: new Date().toISOString()
        };

        this.users.push(user);
        Storage.save('users-proyecto1', this.users);

        Forms.reset(form);
        UI.showAlert('alerts-proyecto1', 'Usuario agregado correctamente', 'success');
        this.renderUsers();
    },

    renderUsers() {
        const container = document.getElementById('usersList');
        const countEl = document.getElementById('usersCount');

        if (!container) return;

        if (countEl) {
            countEl.textContent = this.users.length;
        }

        if (this.users.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-4">No hay usuarios registrados</p>';
            return;
        }

        container.innerHTML = this.users.map(user => `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="bi bi-person-circle me-2"></i>${UI.escapeHtml(user.nombre)}
                        </h5>
                        <p class="card-text mb-1">
                            <i class="bi bi-envelope me-2"></i>${UI.escapeHtml(user.email)}
                        </p>
                        <p class="card-text">
                            <i class="bi bi-calendar me-2"></i>${user.edad} años
                        </p>
                        <div class="d-grid">
                            <button class="btn btn-outline-danger btn-sm" onclick="App.deleteUser('${user.id}')">
                                <i class="bi bi-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    deleteUser(id) {
        UI.showConfirm('Eliminar Usuario', '¿Está seguro de eliminar este usuario?', () => {
            this.users = this.users.filter(u => u.id !== id);
            Storage.save('users-proyecto1', this.users);
            this.renderUsers();
            UI.showAlert('alerts-proyecto1', 'Usuario eliminado correctamente', 'success');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});