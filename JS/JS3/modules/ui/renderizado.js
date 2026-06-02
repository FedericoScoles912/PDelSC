// Tamaño de celda responsive: más pequeño en móviles, más grande en escritorio
export function getTamanoCelda() {
    if (window.innerWidth <= 768) {
        return 25; // Móviles
    }
    return 40; // Escritorio y tablets grandes
}

const imagenes = {};

export function inicializarImagenes() {
    const paths = {
        jugador1Cabeza: '/assets/jugador1/cabeza.svg',
        jugador1Cuerpo1: '/assets/jugador1/cuerpo1.svg',
        jugador1Cuerpo2: '/assets/jugador1/cuerpo2.svg',
        jugador2Cabeza: '/assets/jugador2/cabeza.svg',
        jugador2Cuerpo1: '/assets/jugador2/cuerpo1.svg',
        jugador2Cuerpo2: '/assets/jugador2/cuerpo2.svg',
        botella: '/assets/comida/vara.svg'
    };
    
    for (const [nombre, ruta] of Object.entries(paths)) {
        imagenes[nombre] = new Image();
        imagenes[nombre].src = ruta;
    }
}

export function obtenerTamanoCelda() {
    return getTamanoCelda();
}

function dibujarParedDecorada(ctx, x, y, tamanoCelda, tipo) {
    const gradient = ctx.createLinearGradient(x, y, x + tamanoCelda, y + tamanoCelda);
    
    if (tipo === 'purple') {
        gradient.addColorStop(0, '#4a0078');
        gradient.addColorStop(0.5, '#7a00c8');
        gradient.addColorStop(1, '#4a0078');
    } else {
        gradient.addColorStop(0, '#5a3d00');
        gradient.addColorStop(0.5, '#8b5a00');
        gradient.addColorStop(1, '#5a3d00');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, tamanoCelda, tamanoCelda);
    
    // Add stone brick pattern
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 2, tamanoCelda - 4, tamanoCelda - 4);
}

function dibujarBotellaEnBarra(ctx, x, y, tamanoCelda) {
    const coloresBotellas = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff6600', '#ff0066'];
    const color = coloresBotellas[Math.floor(Math.random() * coloresBotellas.length)];
    
    ctx.fillStyle = 'rgba(139, 90, 0, 0.8)';
    ctx.fillRect(x + tamanoCelda * 0.2, y + tamanoCelda * 0.3, tamanoCelda * 0.6, tamanoCelda * 0.6);
    
    ctx.fillStyle = color;
    ctx.fillRect(x + tamanoCelda * 0.25, y + tamanoCelda * 0.35, tamanoCelda * 0.5, tamanoCelda * 0.5);
    
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(x + tamanoCelda * 0.3, y + tamanoCelda * 0.4, tamanoCelda * 0.15, tamanoCelda * 0.3);
}

export function dibujarEscenario(ctx, anchoCanvas, altoCanvas) {
    const TAMANO_CELDA = getTamanoCelda();
    
    // Dark background with subtle gradient
    const bgGradient = ctx.createLinearGradient(0, 0, anchoCanvas, altoCanvas);
    bgGradient.addColorStop(0, '#0f0f1a');
    bgGradient.addColorStop(0.5, '#1a1a2e');
    bgGradient.addColorStop(1, '#0f0f1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, anchoCanvas, altoCanvas);
    
    // Subtle grid
    ctx.strokeStyle = 'rgba(102, 0, 153, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= anchoCanvas; x += TAMANO_CELDA) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, altoCanvas);
        ctx.stroke();
    }
    for (let y = 0; y <= altoCanvas; y += TAMANO_CELDA) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(anchoCanvas, y);
        ctx.stroke();
    }
    
    // Top bar (party bottles)
    const topBarGradient = ctx.createLinearGradient(0, 0, 0, TAMANO_CELDA);
    topBarGradient.addColorStop(0, '#8b5a00');
    topBarGradient.addColorStop(0.5, '#a87c00');
    topBarGradient.addColorStop(1, '#8b5a00');
    ctx.fillStyle = topBarGradient;
    ctx.fillRect(0, 0, anchoCanvas, TAMANO_CELDA);
    
    // Draw party bottles on top bar (every 2 cells)
    for (let x = TAMANO_CELDA; x < anchoCanvas - TAMANO_CELDA; x += TAMANO_CELDA * 2) {
        dibujarBotellaEnBarra(ctx, x, 0, TAMANO_CELDA);
    }
    
    // Left and right walls
    for (let y = TAMANO_CELDA; y < altoCanvas - TAMANO_CELDA; y += TAMANO_CELDA) {
        dibujarParedDecorada(ctx, 0, y, TAMANO_CELDA, 'purple');
        dibujarParedDecorada(ctx, anchoCanvas - TAMANO_CELDA, y, TAMANO_CELDA, 'purple');
    }
    
    // Bottom wall
    const bottomBarGradient = ctx.createLinearGradient(0, altoCanvas - TAMANO_CELDA, 0, altoCanvas);
    bottomBarGradient.addColorStop(0, '#8b5a00');
    bottomBarGradient.addColorStop(0.5, '#a87c00');
    bottomBarGradient.addColorStop(1, '#8b5a00');
    ctx.fillStyle = bottomBarGradient;
    ctx.fillRect(0, altoCanvas - TAMANO_CELDA, anchoCanvas, TAMANO_CELDA);
}

export function dibujarComida(ctx, comida) {
    const TAMANO_CELDA = getTamanoCelda();
    if (imagenes.botella.complete) {
        // Add glow effect
        const glowGradient = ctx.createRadialGradient(
            comida.x * TAMANO_CELDA + TAMANO_CELDA/2, 
            comida.y * TAMANO_CELDA + TAMANO_CELDA/2, 
            0, 
            comida.x * TAMANO_CELDA + TAMANO_CELDA/2, 
            comida.y * TAMANO_CELDA + TAMANO_CELDA/2, 
            TAMANO_CELDA
        );
        glowGradient.addColorStop(0, 'rgba(0,255,255,0.4)');
        glowGradient.addColorStop(1, 'rgba(0,255,255,0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(
            comida.x * TAMANO_CELDA - TAMANO_CELDA/3, 
            comida.y * TAMANO_CELDA - TAMANO_CELDA/3, 
            TAMANO_CELDA * 1.66, 
            TAMANO_CELDA * 1.66
        );
        
        ctx.drawImage(imagenes.botella, comida.x * TAMANO_CELDA, comida.y * TAMANO_CELDA, TAMANO_CELDA, TAMANO_CELDA);
    } else {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(comida.x * TAMANO_CELDA + 2, comida.y * TAMANO_CELDA + 2, TAMANO_CELDA - 4, TAMANO_CELDA - 4);
    }
}

export function dibujarTren(ctx, jugador) {
    const TAMANO_CELDA = getTamanoCelda();
    jugador.tren.forEach((segmento, index) => {
        let imagen;
        if (jugador.equipo === 1) {
            if (index === 0) {
                imagen = imagenes.jugador1Cabeza;
            } else if (index % 2 === 1) {
                imagen = imagenes.jugador1Cuerpo1;
            } else {
                imagen = imagenes.jugador1Cuerpo2;
            }
        } else {
            if (index === 0) {
                imagen = imagenes.jugador2Cabeza;
            } else if (index % 2 === 1) {
                imagen = imagenes.jugador2Cuerpo1;
            } else {
                imagen = imagenes.jugador2Cuerpo2;
            }
        }

        if (imagen && imagen.complete) {
            ctx.drawImage(imagen, segmento.x * TAMANO_CELDA, segmento.y * TAMANO_CELDA, TAMANO_CELDA, TAMANO_CELDA);
        } else {
            // Dibujo de respaldo estilo pixel art, como en la referencia
            const colores = jugador.equipo === 1 
                ? { cabeza: '#00cc00', cuerpo1: '#ffcc00', cuerpo2: '#009900', sombra: '#005500' }
                : { cabeza: '#0066ff', cuerpo1: '#000099', cuerpo2: '#9900ff', sombra: '#000055' };

            let colorPrincipal, colorSecundario, colorSombra;
            if (index === 0) {
                colorPrincipal = colores.cabeza;
                colorSecundario = '#ffcc00'; // detalle
            } else if (index % 2 === 1) {
                colorPrincipal = colores.cuerpo1;
                colorSecundario = '#ff9900';
            } else {
                colorPrincipal = colores.cuerpo2;
                colorSecundario = '#cc6600';
            }
            colorSombra = colores.sombra;
            
            const x = segmento.x * TAMANO_CELDA;
            const y = segmento.y * TAMANO_CELDA;
            const padding = TAMANO_CELDA * 0.1;
            const size = TAMANO_CELDA - padding * 2;
            
            // Sombras
            ctx.fillStyle = colorSombra;
            ctx.fillRect(x + padding + 2, y + padding + 2, size, size);
            
            // Cuerpo principal
            ctx.fillStyle = colorPrincipal;
            ctx.fillRect(x + padding, y + padding, size, size);
            
            // Detalles
            ctx.fillStyle = colorSecundario;
            ctx.fillRect(x + padding + size * 0.3, y + padding + size * 0.1, size * 0.4, size * 0.3);
            
            // Ojos para la cabeza
            if (index === 0) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x + padding + size * 0.2, y + padding + size * 0.2, size * 0.2, size * 0.2);
                ctx.fillRect(x + padding + size * 0.6, y + padding + size * 0.2, size * 0.2, size * 0.2);
                
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + padding + size * 0.25, y + padding + size * 0.25, size * 0.1, size * 0.1);
                ctx.fillRect(x + padding + size * 0.65, y + padding + size * 0.25, size * 0.1, size * 0.1);
            }
        }
    });
}
