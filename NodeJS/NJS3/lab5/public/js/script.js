document.addEventListener('DOMContentLoaded', () => {
    const btnTable = document.getElementById('btn-inject-table');
    const btnPricing = document.getElementById('btn-inject-pricing');
    const btnClear = document.getElementById('btn-clear-inner');
    const injectContainer = document.getElementById('dynamic-injection-container');

    btnTable.addEventListener('click', () => {
        injectContainer.innerHTML = `
            <table class="table table-bordered table-hover bg-white">
                <thead class="table-primary">
                    <tr><th>ID</th><th>Servicio</th><th>Costo</th></tr>
                </thead>
                <tbody>
                    <tr><td>101</td><td>Hosting Cloud</td><td>$25/mo</td></tr>
                    <tr><td>102</td><td>Dominio .com</td><td>$12/yr</td></tr>
                    <tr><td>103</td><td>Certificado SSL</td><td>$0/yr</td></tr>
                </tbody>
            </table>
        `;
    });

    btnPricing.addEventListener('click', () => {
        injectContainer.innerHTML = `
            <div class="row g-3">
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-body text-center">
                            <h5>Plan Básico</h5>
                            <h2 class="display-6">$0</h2>
                            <button class="btn btn-primary btn-sm">Empezar</button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card shadow-sm border-primary">
                        <div class="card-body text-center">
                            <h5>Plan Premium</h5>
                            <h2 class="display-6">$49</h2>
                            <button class="btn btn-primary btn-sm">Comprar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    btnClear.addEventListener('click', () => {
        injectContainer.innerHTML = '<p class="text-muted italic">Contenedor limpio.</p>';
    });
});
