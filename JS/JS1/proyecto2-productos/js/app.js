const App = {
    products: [],

    init() {
        Storage.setTheme(Storage.getTheme());
        this.initThemeToggle();
        this.loadData();
        this.initForm();
        this.initSearch();
        this.renderProducts();
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
        this.products = Storage.load('products-proyecto2', []);
    },

    initForm() {
        const form = document.getElementById('productForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProductForm(form);
            });
        }
    },

    initSearch() {
        const searchInput = document.getElementById('searchProduct');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderProducts(searchInput.value);
            });
        }
    },

    handleProductForm(form) {
        const rules = {
            nombre: { required: true, minLength: 2, maxLength: 100 },
            categoria: { required: true },
            marca: { required: true, minLength: 2 },
            precio: { required: true },
            stock: { required: true },
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
                UI.showAlert('alerts-proyecto2', 'Producto actualizado correctamente', 'success');
            }
            delete form.dataset.productId;
            document.getElementById('productFormSubmit').innerHTML = '<i class="bi bi-save me-2"></i>Agregar Producto';
        } else {
            const product = {
                id: UI.generateId(),
                ...data,
                fecha: new Date().toISOString()
            };
            this.products.push(product);
            UI.showAlert('alerts-proyecto2', 'Producto agregado correctamente', 'success');
        }

        Storage.save('products-proyecto2', this.products);
        Forms.reset(form);
        this.renderProducts();
    },

    renderProducts(search = '') {
        let filtered = this.products;

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = this.products.filter(p =>
                p.nombre.toLowerCase().includes(searchLower) ||
                (p.categoria && p.categoria.toLowerCase().includes(searchLower)) ||
                (p.marca && p.marca.toLowerCase().includes(searchLower))
            );
        }

        const tableBody = document.getElementById('productsTableBody');
        const cardsContainer = document.getElementById('productsCards');

        if (tableBody) {
            if (filtered.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No hay productos</td></tr>';
            } else {
                tableBody.innerHTML = filtered.map(product => `
                    <tr>
                        <td>${UI.escapeHtml(product.nombre)}</td>
                        <td><span class="badge bg-secondary">${UI.escapeHtml(product.categoria || 'N/A')}</span></td>
                        <td>${UI.escapeHtml(product.marca || 'N/A')}</td>
                        <td>$${parseFloat(product.precio || 0).toFixed(2)}</td>
                        <td>${product.stock || 0}</td>
                        <td>${UI.escapeHtml(product.descripcion || '')}</td>
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
                cardsContainer.innerHTML = '<p class="text-muted text-center w-100 py-4">No hay productos</p>';
            } else {
                cardsContainer.innerHTML = filtered.map(product => `
                    <div class="col-md-4 col-lg-3 mb-4">
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">${UI.escapeHtml(product.nombre)}</h5>
                                <span class="badge bg-success mb-2">${UI.escapeHtml(product.categoria || 'N/A')}</span>
                                <p class="card-text small mb-1"><strong>Marca:</strong> ${UI.escapeHtml(product.marca || 'N/A')}</p>
                                <p class="card-text small mb-1"><strong>Precio:</strong> $${parseFloat(product.precio || 0).toFixed(2)}</p>
                                <p class="card-text small mb-2"><strong>Stock:</strong> ${product.stock || 0} unidades</p>
                                <p class="card-text">${UI.escapeHtml(product.descripcion || '')}</p>
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
        document.getElementById('productFormSubmit').innerHTML = '<i class="bi bi-pencil me-2"></i>Actualizar Producto';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    deleteProduct(id) {
        UI.showConfirm('Eliminar Producto', '¿Está seguro de eliminar este producto?', () => {
            this.products = this.products.filter(p => p.id !== id);
            Storage.save('products-proyecto2', this.products);
            this.renderProducts(document.getElementById('searchProduct').value);
            UI.showAlert('alerts-proyecto2', 'Producto eliminado correctamente', 'success');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});