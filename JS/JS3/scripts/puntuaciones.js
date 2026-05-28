console.log('🏆 Puntuaciones script loaded');

import { obtenerPuntuaciones } from '../modules/servicios/bd.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ DOM loaded (Puntuaciones)');
    await mostrarPuntuaciones();
});

async function mostrarPuntuaciones() {
    console.log('🏆 mostrarPuntuaciones()');
    const lista = document.getElementById('lista-puntuaciones');
    
    try {
        const puntuaciones = await obtenerPuntuaciones();
        console.log('📋 Puntuaciones obtained:', puntuaciones);
        
        lista.innerHTML = '';
        
        if (puntuaciones.length === 0) {
            lista.innerHTML = '<p class="text-muted text-center fs-4 mt-5">No hay puntuaciones aún!</p>';
            return;
        }
        
        // Sort again to be safe (descending by score, then ascending by time)
        puntuaciones.sort((a, b) => {
            if (b.puntaje !== a.puntaje) {
                return b.puntaje - a.puntaje;
            }
            return a.tiempo - b.tiempo;
        });
        
        puntuaciones.forEach((p, i) => {
            console.log('📌 Rendering score #', i + 1, ':', JSON.stringify(p));
            const div = document.createElement('div');
            div.className = 'card bg-dark border-light mb-3 shadow-lg';
            div.innerHTML = `
                <div class="card-body d-flex justify-content-between align-items-center px-5 py-4">
                    <h5 class="card-title mb-0 fs-4 fw-bold text-warning">#${i + 1} ${p.nombre}</h5>
                    <p class="card-text mb-0 fs-4 fw-bold text-success">${p.puntaje} pts</p>
                </div>
            `;
            lista.appendChild(div);
        });
    } catch (error) {
        console.error('❌ Error loading scores:', error);
        lista.innerHTML = '<p class="text-danger text-center fs-4">Error al cargar las puntuaciones!</p>';
    }
}
