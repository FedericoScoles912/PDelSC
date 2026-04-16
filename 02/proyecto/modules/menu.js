export const MENU_ITEMS = [
    { href: '/', label: 'Inicio' },
    { href: '/politica', label: 'Politica' },
    { href: '/economia', label: 'Economia' },
    { href: '/tecnologia', label: 'Tecnologia' },
    { href: '/cultura', label: 'Cultura' },
    { href: '/deportes', label: 'Deportes' },
    { href: '/calculadora', label: 'Calculadora' },
    { href: '/clima', label: 'Clima' }
];

export const buildMenu = (currentPath = '/') => {
    const items = MENU_ITEMS.map((item) => {
        const isActive = item.href === currentPath;
        const activeClass = isActive ? ' active' : '';
        const activeAria = isActive ? ' aria-current="page"' : '';

        return `
            <li class="nav-item">
                <a class="nav-link${activeClass}" href="${item.href}"${activeAria}>${item.label}</a>
            </li>
        `;
    }).join('');

    return `
        <nav class="navbar navbar-expand-lg newspaper-navbar sticky-top">
            <div class="container">
                <a class="navbar-brand fw-bold text-uppercase" href="/">Diario Federal</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Abrir navegacion">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="mainNavbar">
                    <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                        ${items}
                    </ul>
                </div>
            </div>
        </nav>
    `;
};
