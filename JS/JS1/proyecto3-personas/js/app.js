const App = {
    people: [],

    init() {
        Storage.setTheme(Storage.getTheme());
        this.initThemeToggle();
        this.loadData();
        this.initForm();
        this.initSearch();
        this.initHijosToggle();
        this.renderPeople();
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
        this.people = Storage.load('people-proyecto3', []);
    },

    initForm() {
        const form = document.getElementById('personForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePersonForm(form);
            });
        }
    },

    initSearch() {
        const searchInput = document.getElementById('searchPerson');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderPeople(searchInput.value);
            });
        }
    },

    initHijosToggle() {
        const hasHijosSelect = document.getElementById('hijos');
        if (hasHijosSelect) {
            hasHijosSelect.addEventListener('change', () => {
                const cantidadHijosDiv = document.getElementById('cantidadHijosDiv');
                if (hasHijosSelect.value === 'si') {
                    cantidadHijosDiv.style.display = 'block';
                } else {
                    cantidadHijosDiv.style.display = 'none';
                    document.getElementById('cantidadHijos').value = '';
                }
            });
        }
    },

    handlePersonForm(form) {
        const rules = {
            nombre: { required: true, minLength: 2, maxLength: 50, letters: true },
            apellido: { required: true, minLength: 2, maxLength: 50, letters: true },
            edad: { required: true, integer: true },
            fechaNacimiento: { required: true, date: true, age: true, minAge: 0, maxAge: 120 },
            sexo: { required: true },
            documento: { required: true, document: true },
            estadoCivil: { required: true },
            nacionalidad: { required: true, minLength: 2, letters: true },
            telefono: { required: true, numbers: true },
            emailUsuario: { required: true, minLength: 2 },
            emailProveedor: { required: true, minLength: 2 },
            emailDominio: { required: true },
            hijos: { required: true },
            direccion: { required: true, minLength: 5 },
            ciudad: { required: true, minLength: 2, letters: true }
        };

        const hasHijos = form.querySelector('[name="hijos"]').value;
        if (hasHijos === 'si') {
            rules.cantidadHijos = { required: true, integer: true };
        }

        if (!Validations.validateForm(form, rules)) {
            UI.showAlert('alerts-proyecto3', 'Por favor, corrija los errores del formulario', 'danger');
            return;
        }

        const emailUsuario = form.querySelector('[name="emailUsuario"]').value;
        const emailProveedor = form.querySelector('[name="emailProveedor"]').value;
        const emailDominio = form.querySelector('[name="emailDominio"]').value;
        const emailCompleto = `${emailUsuario}@${emailProveedor}.${emailDominio}`;

        const data = Forms.getFormData(form);
        const personId = form.dataset.personId;

        const person = {
            id: personId || UI.generateId(),
            ...data,
            mail: emailCompleto,
            edad: parseInt(data.edad),
            cantidadHijos: hasHijos === 'si' ? parseInt(data.cantidadHijos) : 0,
            fecha: new Date().toISOString()
        };

        if (personId) {
            const index = this.people.findIndex(p => p.id === personId);
            if (index !== -1) {
                this.people[index] = person;
                UI.showAlert('alerts-proyecto3', 'Persona actualizada correctamente', 'success');
            }
            delete form.dataset.personId;
            document.getElementById('personFormSubmit').innerHTML = '<i class="bi bi-save me-2"></i>Guardar Persona';
        } else {
            this.people.push(person);
            UI.showAlert('alerts-proyecto3', 'Persona guardada correctamente', 'success');
        }

        Storage.save('people-proyecto3', this.people);
        Forms.reset(form);
        document.getElementById('cantidadHijosDiv').style.display = 'none';
        this.renderPeople();
    },

    renderPeople(search = '') {
        let filtered = this.people;

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = this.people.filter(p =>
                `${p.nombre} ${p.apellido}`.toLowerCase().includes(searchLower) ||
                p.documento.includes(search) ||
                p.mail.toLowerCase().includes(searchLower)
            );
        }

        const container = document.getElementById('peopleList');

        if (!container) return;

        if (filtered.length === 0) {
            container.innerHTML = '<p class="text-muted text-center w-100 py-4">No hay personas registradas</p>';
            return;
        }

        container.innerHTML = filtered.map(person => `
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h5 class="card-title">
                                    <i class="bi bi-person-circle me-2"></i>
                                    ${UI.escapeHtml(person.nombre)} ${UI.escapeHtml(person.apellido)}
                                </h5>
                                <div class="row g-2 mt-3">
                                    <div class="col-md-3">
                                        <small class="text-muted"><i class="bi bi-card-text me-1"></i> Documento:</small>
                                        <div>${UI.escapeHtml(person.documento)}</div>
                                    </div>
                                    <div class="col-md-3">
                                        <small class="text-muted"><i class="bi bi-envelope me-1"></i> Email:</small>
                                        <div>${UI.escapeHtml(person.mail)}</div>
                                    </div>
                                    <div class="col-md-3">
                                        <small class="text-muted"><i class="bi bi-telephone me-1"></i> Teléfono:</small>
                                        <div>${UI.escapeHtml(person.telefono)}</div>
                                    </div>
                                    <div class="col-md-3">
                                        <small class="text-muted"><i class="bi bi-geo-alt me-1"></i> Ciudad:</small>
                                        <div>${UI.escapeHtml(person.ciudad)}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 text-md-end mt-3 mt-md-0">
                                <button class="btn btn-outline-primary me-2" onclick="App.editPerson('${person.id}')">
                                    <i class="bi bi-pencil"></i> Editar
                                </button>
                                <button class="btn btn-outline-danger" onclick="App.deletePerson('${person.id}')">
                                    <i class="bi bi-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    editPerson(id) {
        const person = this.people.find(p => p.id === id);
        if (!person) return;

        const form = document.getElementById('personForm');
        Forms.fill(form, person);
        form.dataset.personId = id;
        document.getElementById('personFormSubmit').innerHTML = '<i class="bi bi-pencil me-2"></i>Actualizar Persona';

        // Split email into user, proveedor, and dominio
        if (person.mail) {
            const emailParts = person.mail.split('@');
            if (emailParts.length === 2) {
                document.getElementById('emailUsuarioPersona').value = emailParts[0];
                const domainParts = emailParts[1].split('.');
                if (domainParts.length >= 2) {
                    // Handle cases like "gmail.com" or "gmail.com.ar"
                    const dominio = domainParts.slice(-2).join('.'); // Take last 2 parts for .com.ar, .edu.ar, etc.
                    const proveedor = domainParts.slice(0, -2).join('.') || domainParts[0]; // If only 2 parts, first part is proveedor
                    document.getElementById('emailProveedorPersona').value = proveedor;
                    document.getElementById('emailDominioPersona').value = dominio;
                }
            }
        }

        if (person.hijos === 'si') {
            document.getElementById('cantidadHijosDiv').style.display = 'block';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    deletePerson(id) {
        UI.showConfirm('Eliminar Persona', '¿Está seguro de eliminar esta persona?', () => {
            this.people = this.people.filter(p => p.id !== id);
            Storage.save('people-proyecto3', this.people);
            this.renderPeople(document.getElementById('searchPerson').value);
            UI.showAlert('alerts-proyecto3', 'Persona eliminada correctamente', 'success');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});