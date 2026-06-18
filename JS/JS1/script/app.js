const App = {
    users: [],
    products: [],
    people: [],

    init() {
        Storage.setTheme(Storage.getTheme());
        this.initThemeToggle();
        this.initRoutes();
        this.loadData();
        Router.init();
    },

    initThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                Storage.toggleTheme();
            });
        }
    },

    initRoutes() {
        Router.register('/', this.renderHome.bind(this));
        Router.register('/proyecto1', this.renderProyecto1.bind(this));
        Router.register('/proyecto2', this.renderProyecto2.bind(this));
        Router.register('/proyecto3', this.renderProyecto3.bind(this));
    },

    loadData() {
        this.users = Storage.load('users', []);
        this.products = Storage.load('products', []);
        this.people = Storage.load('people', []);
    },

    renderHome() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-12 text-center mb-5">
                    <h1 class="display-4 fw-bold mb-3">Bienvenido al Proyecto JavaScript</h1>
                    <p class="lead text-muted">Explora los 3 proyectos interactivos desarrollados con JavaScript Vanilla, Bootstrap 5 y más.</p>
                </div>
            </div>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <i class="bi bi-people-fill display-1 text-primary mb-3"></i>
                            <h3 class="card-title">Proyecto 1</h3>
                            <p class="card-text">Formulario de usuarios con 3 métodos de lectura: getElementById, querySelector y FormData.</p>
                            <a href="#/proyecto1" class="btn btn-primary" data-route="/proyecto1">Ir al Proyecto</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <i class="bi bi-database display-1 text-success mb-3"></i>
                            <h3 class="card-title">Proyecto 2</h3>
                            <p class="card-text">Gestión de datos generales con CRUD, tabla, cards y búsquedas.</p>
                            <a href="#/proyecto2" class="btn btn-success" data-route="/proyecto2">Ir al Proyecto</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <i class="bi bi-person-vcard display-1 text-info mb-3"></i>
                            <h3 class="card-title">Proyecto 3</h3>
                            <p class="card-text">Sistema completo de personas con localStorage y validaciones avanzadas.</p>
                            <a href="#/proyecto3" class="btn btn-info text-white" data-route="/proyecto3">Ir al Proyecto</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderProyecto1() {
        document.getElementById('app').innerHTML = `
            <div class="row mb-4">
                <div class="col-12">
                    <h1 class="mb-2"><i class="bi bi-people-fill me-2 text-primary"></i> Proyecto 1 - Usuarios</h1>
                    <p class="lead text-muted">Formulario de usuarios usando getElementById, querySelector y FormData</p>
                </div>
            </div>
            
            <div class="row">
                <div class="col-lg-5 mb-4">
                    <div class="card">
                        <div class="card-header">
                        <h5 class="mb-0"><i class="bi bi-person-plus me-2"></i>Agregar Usuario</h5>
                        </div>
                        <div class="card-body">
                            <div id="alerts-proyecto1"></div>
                            <form id="userForm">
                                <div class="mb-3">
                                    <label for="nombre" class="form-label">Nombre</label>
                                    <input type="text" class="form-control" id="nombre" name="nombre" placeholder="Ingrese su nombre">
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label for="emailUsuario" class="form-label">Email</label>
                                    <div class="input-group email-group">
                            <input type="text" class="form-control" id="emailUsuario" name="emailUsuario" placeholder="username">
                            <span class="input-group-text">@</span>
                            <input type="text" class="form-control" id="emailProveedor" name="emailProveedor" placeholder="mail">
                            <span class="input-group-text">.</span>
                            <select class="form-select" id="emailDominio" name="emailDominio">
                                <option value="com">com</option>
                                <option value="ar">ar</option>
                                <option value="com.ar">com.ar</option>
                                <option value="edu.ar">edu.ar</option>
                                <option value="gov.ar">gov.ar</option>
                                <option value="net">net</option>
                                <option value="org">org</option>
                            </select>
                        </div>
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label for="edad" class="form-label">Edad</label>
                                    <input type="text" class="form-control" id="edad" name="edad" placeholder="Ingrese su edad">
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="bi bi-save me-2"></i>Agregar Usuario
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-lg-7">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0"><i class="bi bi-list-ul me-2"></i>Usuarios Registrados</h5>
                            <span class="badge bg-primary rounded-pill" id="usersCount"></span>
                        </div>
                        <div class="card-body">
                            <div class="row" id="usersList"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.initProyecto1();
    },

    initProyecto1() {
        const form = document.getElementById('userForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUserForm(form);
            });
        }
        this.renderUsers();
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
        Storage.save('users', this.users);

        Forms.reset(form);
        UI.showAlert('alerts-proyecto1', 'Usuario agregado correctamente', 'success');
        this.renderUsers();
    },

    renderUsers() {
        const container = document.getElementById('usersList');
        if (!container) return;

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
            Storage.save('users', this.users);
            this.renderUsers();
            UI.showAlert('alerts-proyecto1', 'Usuario eliminado correctamente', 'success');
        });
    },

    renderProyecto2() {
        document.getElementById('app').innerHTML = `
            <div class="row mb-4">
                <div class="col-12">
                    <h1 class="mb-2"><i class="bi bi-database me-2 text-success"></i> Proyecto 2 - Gestión de Datos</h1>
                    <p class="lead text-muted">Gestión de datos generales con CRUD, tabla, cards y búsquedas</p>
                </div>
            </div>
            
            <div class="row">
                <div class="col-lg-5 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="bi bi-plus-circle me-2"></i>Dato a Ingresar</h5>
                        </div>
                        <div class="card-body">
                            <div id="alerts-proyecto2"></div>
                            <form id="productForm">
                                <div class="mb-3">
                                    <label class="form-label">Nombre del dato</label>
                                    <input type="text" class="form-control" name="nombre" placeholder="Ingrese el nombre del dato">
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Categoría</label>
                                    <input type="text" class="form-control" name="categoria" placeholder="Ingrese la categoría (solo letras)">
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Descripción</label>
                                    <textarea class="form-control" name="descripcion" rows="5" placeholder="Descripción del dato"></textarea>
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-success" id="productFormSubmit">
                                        <i class="bi bi-save me-2"></i>Guardar Dato
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-lg-7">
                    <div class="card mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0"><i class="bi bi-search me-2"></i>Buscador</h5>
                        </div>
                        <div class="card-body">
                            <input type="text" class="form-control" id="searchProduct" placeholder="Buscar por nombre o categoría...">
                        </div>
                    </div>
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="bi bi-table me-2"></i>Tabla de Datos</h5>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-striped table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Categoría</th>
                                            <th>Descripción</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="productsTableBody">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="bi bi-grid-3x2 me-2"></i>Cards de Datos</h5>
                        </div>
                        <div class="card-body">
                            <div class="row" id="productsCards"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.initProyecto2();
    },

    initProyecto2() {
        const form = document.getElementById('productForm');
        const searchInput = document.getElementById('searchProduct');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProductForm(form);
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderProducts(searchInput.value);
            });
        }

        this.renderProducts();
    },

    handleProductForm(form) {
        const rules = {
            nombre: { required: true, minLength: 2, maxLength: 100 },
            categoria: { required: true, minLength: 2, maxLength: 50, letters: true },
            descripcion: { required: true, minLength: 10 }
        };

        if (!Validations.validateForm(form, rules)) {
            UI.showAlert('alerts-proyecto2', 'Por favor, corrija los errores del formulario', 'danger');
            return;
        }

        const data = Forms.getFormData(form);
        const productId = form.dataset.productId;

        if (productId) {
            const index = this.products.findIndex(p => p.id === productId);
            if (index !== -1) {
                this.products[index] = {
                    ...this.products[index],
                    ...data
                };
                UI.showAlert('alerts-proyecto2', 'Dato actualizado correctamente', 'success');
            }
            delete form.dataset.productId;
            document.getElementById('productFormSubmit').textContent = 'Guardar Dato';
        } else {
            const product = {
                id: UI.generateId(),
                ...data,
                fecha: new Date().toISOString()
            };
            this.products.push(product);
            UI.showAlert('alerts-proyecto2', 'Dato agregado correctamente', 'success');
        }

        Storage.save('products', this.products);
        Forms.reset(form);
        this.renderProducts();
    },

    renderProducts(search = '') {
        let filtered = this.products;

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = this.products.filter(p =>
                p.nombre.toLowerCase().includes(searchLower) ||
                p.categoria.toLowerCase().includes(searchLower)
            );
        }

        const tableBody = document.getElementById('productsTableBody');
        const cardsContainer = document.getElementById('productsCards');

        if (tableBody) {
            if (filtered.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No hay datos</td></tr>';
            } else {
                tableBody.innerHTML = filtered.map(product => `
                    <tr>
                        <td>${UI.escapeHtml(product.nombre)}</td>
                        <td><span class="badge bg-secondary">${UI.escapeHtml(product.categoria)}</span></td>
                        <td>${UI.escapeHtml(product.descripcion)}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="App.editProduct('${product.id}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="App.deleteProduct('${product.id}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }

        if (cardsContainer) {
            if (filtered.length === 0) {
                cardsContainer.innerHTML = '<p class="text-muted text-center w-100 py-4">No hay datos</p>';
            } else {
                cardsContainer.innerHTML = filtered.map(product => `
                    <div class="col-md-4 col-lg-3 mb-4">
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">${UI.escapeHtml(product.nombre)}</h5>
                                <span class="badge bg-primary mb-2">${UI.escapeHtml(product.categoria)}</span>
                                <p class="card-text">${UI.escapeHtml(product.descripcion)}</p>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    },

    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        const form = document.getElementById('productForm');
        Forms.fill(form, product);
        form.dataset.productId = id;
        document.getElementById('productFormSubmit').textContent = 'Actualizar Dato';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    deleteProduct(id) {
        UI.showConfirm('Eliminar Dato', '¿Está seguro de eliminar este dato?', () => {
            this.products = this.products.filter(p => p.id !== id);
            Storage.save('products', this.products);
            this.renderProducts(document.getElementById('searchProduct').value);
            UI.showAlert('alerts-proyecto2', 'Dato eliminado correctamente', 'success');
        });
    },

    renderProyecto3() {
        document.getElementById('app').innerHTML = `
            <div class="row mb-4">
                <div class="col-12">
                    <h1 class="mb-2"><i class="bi bi-person-vcard me-2 text-info"></i> Proyecto 3 - Personas</h1>
                    <p class="lead text-muted">Sistema completo de personas con localStorage y validaciones avanzadas</p>
                </div>
            </div>
            
            <div class="row">
                <div class="col-lg-5 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="bi bi-person-plus me-2"></i>Datos de la Persona</h5>
                        </div>
                        <div class="card-body">
                            <div id="alerts-proyecto3"></div>
                            <form id="personForm">
                                <div class="row g-2 mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Nombre</label>
                                        <input type="text" class="form-control" name="nombre" placeholder="Nombre">
                                        <div class="invalid-feedback"></div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Apellido</label>
                                        <input type="text" class="form-control" name="apellido" placeholder="Apellido">
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Edad</label>
                                        <input type="text" class="form-control" name="edad" placeholder="Edad">
                                        <div class="invalid-feedback"></div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Fecha de Nacimiento</label>
                                        <input type="date" class="form-control" name="fechaNacimiento">
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Sexo</label>
                                        <select class="form-select" name="sexo">
                                            <option value="">Seleccione...</option>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Femenino">Femenino</option>
                                        </select>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Documento</label>
                                        <input type="text" class="form-control" name="documento" placeholder="DNI">
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Estado Civil</label>
                                        <select class="form-select" name="estadoCivil">
                                            <option value="">Seleccione...</option>
                                            <option value="Soltero">Soltero</option>
                                            <option value="Casado">Casado</option>
                                            <option value="Divorciado">Divorciado</option>
                                            <option value="Viudo">Viudo</option>
                                        </select>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Nacionalidad</label>
                                        <input type="text" class="form-control" name="nacionalidad" placeholder="Nacionalidad">
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Teléfono</label>
                                        <input type="text" class="form-control" name="telefono" placeholder="Teléfono">
                                        <div class="invalid-feedback"></div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Email</label>
                                        <div class="input-group email-group">
                                <input type="text" class="form-control" name="emailUsuario" id="emailUsuarioPersona" placeholder="username">
                                <span class="input-group-text">@</span>
                                <input type="text" class="form-control" name="emailProveedor" id="emailProveedorPersona" placeholder="mail">
                                <span class="input-group-text">.</span>
                                <select class="form-select" name="emailDominio" id="emailDominioPersona">
                                    <option value="com">com</option>
                                    <option value="ar">ar</option>
                                    <option value="com.ar">com.ar</option>
                                    <option value="edu.ar">edu.ar</option>
                                    <option value="gov.ar">gov.ar</option>
                                    <option value="net">net</option>
                                    <option value="org">org</option>
                                </select>
                            </div>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label">¿Tiene Hijos?</label>
                                        <select class="form-select" name="hijos" id="hijos">
                                            <option value="">Seleccione...</option>
                                            <option value="si">Sí</option>
                                            <option value="no">No</option>
                                        </select>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                    <div class="col-md-6" id="cantidadHijosDiv" style="display: none;">
                                        <label class="form-label">Cantidad de Hijos</label>
                                        <input type="text" class="form-control" name="cantidadHijos" id="cantidadHijos" placeholder="0">
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Dirección</label>
                                    <input type="text" class="form-control" name="direccion" placeholder="Dirección">
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Ciudad</label>
                                    <input type="text" class="form-control" name="ciudad" placeholder="Ciudad">
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-info text-white" id="personFormSubmit">
                                        <i class="bi bi-save me-2"></i>Guardar Persona
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-lg-7">
                    <div class="card mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0"><i class="bi bi-search me-2"></i>Buscador</h5>
                        </div>
                        <div class="card-body">
                            <input type="text" class="form-control" id="searchPerson" placeholder="Buscar por nombre, documento o email...">
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0"><i class="bi bi-list-ul me-2"></i>Listado de Personas</h5>
                        </div>
                        <div class="card-body">
                            <div class="row" id="peopleList"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.initProyecto3();
    },

    initProyecto3() {
        const form = document.getElementById('personForm');
        const searchInput = document.getElementById('searchPerson');
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

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePersonForm(form);
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderPeople(searchInput.value);
            });
        }

        this.renderPeople();
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
            document.getElementById('personFormSubmit').textContent = 'Guardar Persona';
        } else {
            this.people.push(person);
            UI.showAlert('alerts-proyecto3', 'Persona guardada correctamente', 'success');
        }

        Storage.save('people', this.people);
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
        document.getElementById('personFormSubmit').textContent = 'Actualizar Persona';

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
            Storage.save('people', this.people);
            this.renderPeople(document.getElementById('searchPerson').value);
            UI.showAlert('alerts-proyecto3', 'Persona eliminada correctamente', 'success');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
