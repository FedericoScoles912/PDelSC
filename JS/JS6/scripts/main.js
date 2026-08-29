/**
 * @module main
 * @description Entry point del frontend.
 *   Importa y conecta todas las clases del juego.
 *   Orquesta el flujo completo:
 *     fetchWord → iniciar partida → manejar input (click/físico)
 *     → ganar/perder → guardar score → actualizar tabla → PDF.
 *
 *   Este archivo NO contiene lógica de juego ni manipulación DOM compleja:
 *   sólo compone las clases y une los eventos.
 */

import { Game }         from './Game.js';
import { Drawing }      from './Drawing.js';
import { Timer }        from './Timer.js';
import { UIController } from './UIController.js';
import { ScoreManager } from './ScoreManager.js';
import { WordFetcher }  from './WordFetcher.js';
import { exportScoresToPdf } from './PdfExporter.js';

/* =========================================================
   INICIALIZACIÓN DE INSTANCIAS
   ========================================================= */

const ui           = new UIController();
const wordFetcher  = new WordFetcher();
const scoreManager = new ScoreManager('', ui);
const timer        = new Timer();

const svgEl   = document.getElementById('hangmanSvg');
const drawing = new Drawing(svgEl);

// Game se inicializa con una palabra temporal (se reemplaza inmediatamente).
let game  = new Game('A');
let scores = [];
let currentPlayer = '';   // Último nombre guardado (para resaltar la fila del jugador)
let lastResult = null;    // { won, points, time } última partida terminada

/* =========================================================
   TEMA (modo claro/oscuro) con persistencia y prefers-color-scheme
   ========================================================= */

(function initTheme() {
  const btn = document.getElementById('themeToggle');
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored || (prefersDark ? 'dark' : 'light');
  if (initial === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

  btn?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });
})();

/* =========================================================
   RENDER DE TABLA DE POSICIONES
   ========================================================= */

/**
 * Renderiza la tabla de scores del panel izquierdo.
 * @param {Array} list Scores a renderizar.
 */
function renderScoreboard(list) {
  const tbody = document.getElementById('scoreboardBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!Array.isArray(list) || list.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.className = 'score-empty text-center py-4';
    td.textContent = 'Todavía no hay puntuaciones. ¡Sé el primero!';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  list.forEach((s, i) => {
    const tr = document.createElement('tr');
    if (currentPlayer && String(s.nombre || '').trim().toLowerCase() === currentPlayer.trim().toLowerCase()) {
      tr.classList.add('score-current');
    }

    const tdPos = document.createElement('td');
    const pos = i + 1;
    if (pos <= 3) {
      const span = document.createElement('span');
      span.className = `score-position-medal score-pos-${pos}`;
      span.textContent = pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉';
      tdPos.appendChild(span);
    } else {
      tdPos.textContent = `${pos}°`;
    }

    const tdName = document.createElement('td');
    tdName.textContent = s.nombre;

    const tdPts = document.createElement('td');
    tdPts.textContent = Number(s.puntos) | 0;

    const tdTime = document.createElement('td');
    tdTime.textContent = Timer.format(Number(s.tiempo) | 0);

    tr.append(tdPos, tdName, tdPts, tdTime);
    tbody.appendChild(tr);
  });
}

/** Muestra un estado de error en la tabla de scores. */
function renderScoreboardError(message) {
  const tbody = document.getElementById('scoreboardBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const tr = document.createElement('tr');
  const td = document.createElement('td');
  td.colSpan = 4;
  td.className = 'score-error text-center py-4';
  td.innerHTML = `<strong>⚠️ ${message || 'Error'}</strong><br><small class="text-muted">Verificá que el servidor esté corriendo.</small>`;
  tr.appendChild(td);
  tbody.appendChild(tr);
}

async function refreshScores() {
  try {
    scores = await scoreManager.getScores();
    renderScoreboard(scores);
  } catch (err) {
    renderScoreboardError(err?.message || 'No se pudo cargar la tabla.');
  }
}

/* =========================================================
   FLUJO DEL JUEGO
   ========================================================= */

/**
 * Actualiza todos los elementos visuales a partir del estado actual de `game`.
 */
function syncUI() {
  ui.renderWord(game.getDisplayWord());
  ui.setAttempts(game.getAttemptsLeft());
  ui.setLetterBanks(game.getCorrectGuesses(), game.getWrongGuesses());

  const uniqueTotal    = new Set(game.getWord().split('')).size;
  const uniqueRevealed = new Set(game.getCorrectGuesses()).size;
  ui.setProgress(uniqueRevealed, uniqueTotal);
}

/**
 * Inicia (o reinicia) una nueva partida:
 *   1) Muestra spinner mientras se obtiene la palabra.
 *   2) Resetea Game, Drawing, Timer y UI.
 *   3) Comienza el cronómetro.
 */
async function startNewGame() {
  ui.showLoader();
  drawing.reset(false);
  ui.setKeyboardEnabled(false);
  document.getElementById('saveScoreBtn').disabled = true;
  lastResult = null;

  try {
    const { word, category, fallback } = await wordFetcher.fetchWord();
    game = new Game(word);
    ui.setCategory(category || 'General');

    drawing.reset(true);
    ui.resetKeyboard();
    syncUI();
    timer.restart();
    ui.setKeyboardEnabled(true);

    if (fallback) {
      ui.showPopup(
        'Conexión limitada',
        'No se pudo acceder a la API de palabras. Estamos usando un <strong>listado local de respaldo</strong>. ¡Divertite igual!',
        'info',
        { okLabel: 'Entendido' }
      );
    }
  } catch (err) {
    ui.showPopup(
      'Error inesperado',
      `Ocurrió un problema al obtener una palabra: ${err?.message || 'desconocido'}`,
      'error',
      { okLabel: 'Reintentar', onClose: () => startNewGame() }
    );
  } finally {
    ui.hideLoader();
  }
}

/**
 * Procesa la adivinanza de una letra, actualiza UI, Drawing, detecta fin.
 * @param {string} letter
 */
function handleGuess(letter) {
  if (!letter || game.isWon() || game.isLost()) return;

  const prevStage = game.getStage();
  const res = game.guess(letter);

  if (res.alreadyUsed) return;

  if (res.correct) {
    ui.setKeyState(letter, 'correct');
  } else {
    ui.setKeyState(letter, 'wrong');
    if (game.getStage() > prevStage) drawing.nextStage();
  }

  syncUI();

  if (res.gameOver) {
    finishGame(res.won);
  }
}

/**
 * Maneja el fin de la partida (victoria o derrota).
 *   - Detiene el Timer.
 *   - Calcula puntos si ganó.
 *   - Muestra el MODAL correspondiente (no alert()).
 *   - Habilita/deshabilita botón "Guardar mi Score".
 *
 * @param {boolean} won
 */
function finishGame(won) {
  timer.stop();
  ui.setKeyboardEnabled(false);
  const seconds = timer.getSeconds();
  const points  = game.calculatePoints(seconds);
  lastResult = { won, points, time: seconds, word: game.getWord() };

  const saveBtn = document.getElementById('saveScoreBtn');

  if (won) {
    if (saveBtn) saveBtn.disabled = false;
    showWinModal(points, seconds, game.getWord());
  } else {
    if (saveBtn) saveBtn.disabled = true;
    showLoseModal(game.getWord());
  }
}

/* ---------- Modales de victoria / derrota ---------- */

function showWinModal(points, seconds, word) {
  const body = document.createElement('div');
  body.innerHTML = `
    <p class="text-center mb-0">¡Felicidades, adivinaste la palabra!</p>
    <div class="modal-word-reveal">${word.split('').join(' ')}</div>
    <div class="modal-score-big">
      <div class="score-num">${points} pts</div>
      <div class="score-time">Tiempo: ${Timer.format(seconds)} · Errores: ${game.getWrongGuesses().length}</div>
    </div>
    <div class="name-input-wrapper">
      <label for="playerNameInput" class="form-label">Ingresá tu nombre para guardar el score:</label>
      <input type="text" id="playerNameInput" class="form-control w-100" placeholder="Tu nombre (máx 60 caracteres)" maxlength="60" autocomplete="off">
    </div>
  `;

  ui.showModal('🏆 ¡Ganaste!', body, async () => {
    const input = document.getElementById('playerNameInput');
    const name = (input?.value || '').trim();
    if (!name) {
      ui.showPopup('Nombre requerido', 'Ingresá tu nombre para guardar el score.', 'warning');
      return Promise.reject(); // evita que se cierre
    }
    try {
      await scoreManager.saveScore(name, points, seconds);
      currentPlayer = name;
      ui.showPopup('Score guardado ✅', `¡Excelente, <strong>${escapeHtml(name)}</strong>! Tu score de <strong>${points}</strong> puntos se guardó correctamente.`, 'success');
      await refreshScores();
    } catch (_) {
      // El ScoreManager ya mostró el popup de error
    }
  }, {
    confirmLabel: '💾 Guardar Score',
    cancelLabel:  'Cerrar',
    extraButtons: [
      {
        label: '🔄 Nueva Partida',
        classes: 'btn btn-success game-btn',
        onClick: (modalInstance) => { if (modalInstance) modalInstance.hide(); startNewGame(); }
      }
    ]
  });

  setTimeout(() => {
    document.getElementById('playerNameInput')?.focus();
  }, 300);
}

function showLoseModal(word) {
  const body = document.createElement('div');
  body.innerHTML = `
    <p class="text-center mb-0">Lo siento, se agotaron tus intentos.</p>
    <p class="text-center mb-2 small text-muted">La palabra correcta era:</p>
    <div class="modal-word-reveal">${word.split('').join(' ')}</div>
    <p class="text-center mb-0">¡No te desanimes, volvé a intentarlo!</p>
  `;
  ui.showModal('😢 Perdiste', body, null, {
    showCancel: false,
    extraButtons: [
      {
        label: '🔄 Jugar de nuevo',
        classes: 'btn btn-primary game-btn game-btn-accent',
        onClick: (modalInstance) => { if (modalInstance) modalInstance.hide(); startNewGame(); }
      }
    ]
  });
}

/* ---------- Helpers ---------- */

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* =========================================================
   BOTONES DEL PANEL IZQUIERDO — Guardar score / Descargar PDF
   ========================================================= */

document.getElementById('saveScoreBtn')?.addEventListener('click', async () => {
  if (!lastResult || !lastResult.won) return;
  const { points, time } = lastResult;
  const inputLabel = document.createElement('div');
  inputLabel.innerHTML = `
    <p>Tu última partida terminó con <strong>${points} puntos</strong> en <strong>${Timer.format(time)}</strong>.</p>
    <div class="name-input-wrapper">
      <label for="modalSaveName" class="form-label">Ingresá tu nombre:</label>
      <input type="text" id="modalSaveName" class="form-control" maxlength="60" placeholder="Tu nombre" autocomplete="off">
    </div>
  `;
  ui.showModal('💾 Guardar Score', inputLabel, async () => {
    const name = (document.getElementById('modalSaveName')?.value || '').trim();
    if (!name) {
      ui.showPopup('Nombre requerido', 'Ingresá tu nombre para poder guardar.', 'warning');
      return Promise.reject();
    }
    try {
      await scoreManager.saveScore(name, points, time);
      currentPlayer = name;
      ui.showPopup('¡Guardado!', `Score de <strong>${escapeHtml(name)}</strong> (${points} pts) guardado correctamente.`, 'success');
      document.getElementById('saveScoreBtn').disabled = true;
      await refreshScores();
    } catch (_) { /* popup ya mostrado */ }
  }, { confirmLabel: 'Guardar' });
  setTimeout(() => document.getElementById('modalSaveName')?.focus(), 300);
});

document.getElementById('downloadPdfBtn')?.addEventListener('click', () => {
  try {
    exportScoresToPdf(scores, currentPlayer);
    ui.showPopup('PDF generado', 'La tabla de posiciones se descargó correctamente.', 'success');
  } catch (err) {
    ui.showPopup('Error al generar PDF', err?.message || 'No se pudo generar el PDF. Verificá tu conexión.', 'error');
  }
});

/* =========================================================
   TECLADO VIRTUAL + TECLADO FÍSICO
   ========================================================= */

document.getElementById('newGameBtn')?.addEventListener('click', () => startNewGame());

ui.renderKeyboard((letter) => handleGuess(letter));

document.addEventListener('keydown', (e) => {
  const k = e.key;
  if (k === 'Escape') return; // UIController ya maneja el popup
  if (k === ' ') {
    if (game.isWon() || game.isLost()) startNewGame();
    return;
  }
  if (/^[a-zA-ZñÑ]$/.test(k)) {
    const L = k.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    handleGuess(L === 'N' ? (k.toUpperCase() === 'Ñ' ? 'Ñ' : 'N') : L);
  }
});

/* =========================================================
   TIMER — Actualizar display en cada tick
   ========================================================= */

document.addEventListener('timer:tick', (e) => {
  ui.setTimerDisplay(e.detail.formatted);
});

/* =========================================================
   ARRANQUE
   ========================================================= */

(async function boot() {
  await refreshScores();
  ui.setTimerDisplay(timer.getFormattedTime());
  await startNewGame();
})();
