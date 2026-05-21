const Router = {
    routes: {},
    currentRoute: null,

    register(path, handler) {
        this.routes[path] = handler;
    },

    async navigate(path) {
        if (this.routes[path]) {
            this.currentRoute = path;
            window.location.hash = path;
            await this.routes[path]();
            this.updateActiveNav(path);
        } else {
            await this.routes['/']();
        }
    },

    updateActiveNav(path) {
        const navLinks = document.querySelectorAll('.nav-link[data-route]');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-route') === path) {
                link.classList.add('active');
            }
        });
    },

    async init() {
        window.addEventListener('hashchange', () => {
            const path = window.location.hash.slice(1) || '/';
            this.navigate(path);
        });

        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-route]');
            if (link) {
                e.preventDefault();
                const path = link.getAttribute('data-route');
                this.navigate(path);
            }
        });

        const initialPath = window.location.hash.slice(1) || '/';
        await this.navigate(initialPath);
    },

    async loadPage(pagePath) {
        try {
            const response = await fetch(pagePath);
            if (!response.ok) throw new Error('Page not found');
            return await response.text();
        } catch (error) {
            console.error('Error loading page:', error);
            return '<p class="text-danger">Error al cargar la página</p>';
        }
    }
};
