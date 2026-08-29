/**
 * @class UIController
 * @description Orquesta la interacción con el DOM.
 *   - Renderiza el teclado virtual A-Z con forma octogonal.
 *   - Actualiza los guiones de la palabra, listas de letras correctas/incorrectas,
 *     intentos restantes y barra de progreso.
 *   - Maneja un POPUP propio (no alert) genérico con 4 variantes:
 *     'success' | 'error' | 'info' | 'warning'.
 *   - Maneja el MODAL Bootstrap para confirmaciones y diálogos de
 *     victoria / derrota (reemplaza confirm()).
 */
export class UIController {

  /**
   * @param {{
   *   wordDisplayId?: string,
   *   keyboardId?: string,
   *   attemptsId?: string,
   *   correctLettersId?: string,
   *   wrongLettersId?: string,
   *   progressBarId?: string,
   *   progressPercentId?: string,
   *   progressTextId?: string,
   *   timerDisplayId?: string,
   *   categoryDisplayId?: string,
   *   gameLoaderId?: string,
   * }} [ids] Mapeo opcional de IDs (usa valores por defecto del index.html).
   */
  constructor(ids = {}) {
    this.ids = {
      wordDisplay:       ids.wordDisplayId       || 'wordDisplay',
      keyboard:          ids.keyboardId          || 'keyboard',
      attempts:          ids.attemptsId          || 'attemptsLeft',
      correctLetters:    ids.correctLettersId    || 'correctLetters',
      wrongLetters:      ids.wrongLettersId      || 'wrongLetters',
      progressBar:       ids.progressBarId       || 'progressBar',
      progressPercent:   ids.progressPercentId   || 'progressPercent',
      progressText:      ids.progressTextId      || 'progressText',
      timerDisplay:      ids.timerDisplayId      || 'timerDisplay',
      categoryDisplay:   ids.categoryDisplayId   || 'categoryDisplay',
      gameLoader:        ids.gameLoaderId        || 'gameLoader',
    };

    this.$ = (id) => document.getElementById(id);

    this.#bindPopupEscape();
  }

  /* =========================================================
     RENDER — Teclado virtual
     ========================================================= */

  /**
   * Genera el teclado virtual A-Z en el contenedor #keyboard.
   * Las letras se agrupan en filas de 7-7-6-6 estilo QWERTY compacto.
   *
   * @param {function(string):void} onClick Callback llamado cuando el usuario
   *   hace clic en una letra: (letter) => void.
   */
  renderKeyboard(onClick) {
    const container = this.$(this.ids.keyboard);
    if (!container) return;
    container.innerHTML = '';

    const rows = [
      ['Q','W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L','Ñ'],
      ['Z','X','C','V','B','N','M']
    ];

    rows.forEach(rowLetters => {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row';
      rowLetters.forEach(letter => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'kb-key';
        btn.textContent = letter;
        btn.dataset.letter = letter;
        btn.setAttribute('aria-label', `Letra ${letter}`);
        btn.addEventListener('click', () => {
          if (!btn.disabled) onClick(letter);
        });
        rowEl.appendChild(btn);
      });
      container.appendChild(rowEl);
    });
  }

  /**
   * Deshabilita/habilita y marca de color un botón del teclado.
   * @param {string} letter Letra A-Z/Ñ
   * @param {'correct'|'wrong'|'reset'|null} state Estado a aplicar.
   */
  setKeyState(letter, state) {
    const btn = this.$(this.ids.keyboard)?.querySelector(`[data-letter="${letter}"]`);
    if (!btn) return;
    btn.classList.remove('kb-correct', 'kb-wrong');
    if (state === 'correct') btn.classList.add('kb-correct');
    if (state === 'wrong')   btn.classList.add('kb-wrong');
    btn.disabled = state === 'correct' || state === 'wrong';
  }

  /**
   * Restablece el teclado: quita colores y habilita todos los botones.
   */
  resetKeyboard() {
    const keys = this.$(this.ids.keyboard)?.querySelectorAll('.kb-key') || [];
    keys.forEach(btn => {
      btn.classList.remove('kb-correct', 'kb-wrong');
      btn.disabled = false;
    });
  }

  /**
   * Habilita o deshabilita todo el teclado (bloquear input en fin de partida).
   * @param {boolean} enabled
   */
  setKeyboardEnabled(enabled) {
    const keys = this.$(this.ids.keyboard)?.querySelectorAll('.kb-key') || [];
    keys.forEach(btn => {
      if (!enabled) btn.disabled = true;
      else if (!btn.classList.contains('kb-correct') && !btn.classList.contains('kb-wrong')) {
        btn.disabled = false;
      }
    });
  }

  /* =========================================================
     RENDER — Palabra / progreso
     ========================================================= */

  /**
   * Dibuja los guiones de la palabra.
   * @param {string[]} display Array ['H','_','L','_'] devuelto por Game.getDisplayWord()
   */
  renderWord(display) {
    const el = this.$(this.ids.wordDisplay);
    if (!el) return;
    el.innerHTML = '';
    display.forEach(ch => {
      const span = document.createElement('span');
      span.className = 'word-letter';
      if (ch === ' ') {
        span.classList.add('space');
      } else if (ch !== '_') {
        span.textContent = ch;
        span.classList.add('revealed');
      }
      el.appendChild(span);
    });
  }

  /**
   * Actualiza intentos restantes.
   * @param {number} left
   */
  setAttempts(left) {
    const el = this.$(this.ids.attempts);
    if (el) el.textContent = String(left);
  }

  /**
   * Actualiza los listados de letras correctas / incorrectas.
   * @param {string[]} correct
   * @param {string[]} wrong
   */
  setLetterBanks(correct, wrong) {
    const c = this.$(this.ids.correctLetters);
    const w = this.$(this.ids.wrongLetters);
    if (c) c.textContent = correct.length ? correct.join(' ') : '—';
    if (w) w.textContent = wrong.length   ? wrong.join(' ')   : '—';
  }

  /**
   * Actualiza la barra de progreso de la palabra.
   * @param {number} revealed Cantidad de letras únicas reveladas.
   * @param {number} total    Cantidad de letras únicas de la palabra.
   */
  setProgress(revealed, total) {
    const percent = total === 0 ? 0 : Math.round((revealed / total) * 100);
    const bar = this.$(this.ids.progressBar);
    const pct = this.$(this.ids.progressPercent);
    const txt = this.$(this.ids.progressText);
    if (bar) {
      bar.style.width = `${percent}%`;
      bar.setAttribute('aria-valuenow', String(percent));
    }
    if (pct) pct.textContent = `${percent}%`;
    if (txt) txt.textContent = `${revealed} de ${total} letras reveladas`;
  }

  /**
   * Actualiza el display del timer.
   * @param {string} formatted "MM:SS" o "HH:MM:SS".
   */
  setTimerDisplay(formatted) {
    const el = this.$(this.ids.timerDisplay);
    if (el) el.textContent = formatted;
  }

  /**
   * Actualiza la categoría mostrada.
   * @param {string} cat
   */
  setCategory(cat) {
    const el = this.$(this.ids.categoryDisplay);
    if (el) el.textContent = cat || 'General';
  }

  /** Muestra el spinner de "Cargando palabra..." */
  showLoader() {
    const l = this.$(this.ids.gameLoader);
    if (l) l.classList.remove('hidden');
  }

  /** Oculta el spinner. */
  hideLoader() {
    const l = this.$(this.ids.gameLoader);
    if (l) l.classList.add('hidden');
  }

  /* =========================================================
     POPUP PROPIO (reemplazo de alert)
     ========================================================= */

  /**
   * Muestra un popup centrado.
   *
   * @param {string} title   Título visible.
   * @param {string|HTMLElement} message Contenido del cuerpo.
   * @param {'success'|'error'|'info'|'warning'} [type='info']
   * @param {{okLabel?: string, onClose?: function():void}} [opts]
   */
  showPopup(title, message, type = 'info', opts = {}) {
    const overlay = document.getElementById('popupOverlay');
    const box     = document.getElementById('popupBox');
    const icon    = document.getElementById('popupIcon');
    const tEl     = document.getElementById('popupTitle');
    const body    = document.getElementById('popupBody');
    const okBtn   = document.getElementById('popupOkBtn');
    const closeBtn= document.getElementById('popupClose');
    if (!overlay || !box) return;

    box.classList.remove('popup-type-success','popup-type-error','popup-type-info','popup-type-warning');
    box.classList.add(`popup-type-${type}`);

    icon.className = 'popup-icon';
    icon.classList.add(`icon-${type}`);

    if (tEl) tEl.textContent = title || '';
    if (body) {
      body.innerHTML = '';
      if (message instanceof HTMLElement) body.appendChild(message);
      else body.innerHTML = String(message ?? '');
    }
    if (okBtn) okBtn.textContent = opts.okLabel || 'Aceptar';

    overlay.hidden = false;

    const close = () => {
      overlay.hidden = true;
      okBtn?.removeEventListener('click', close);
      closeBtn?.removeEventListener('click', close);
      if (typeof opts.onClose === 'function') opts.onClose();
    };
    okBtn?.addEventListener('click', close);
    closeBtn?.addEventListener('click', close);
  }

  /** Cierra el popup manualmente. */
  hidePopup() {
    const overlay = document.getElementById('popupOverlay');
    if (overlay) overlay.hidden = true;
  }

  /**
   * Permite cerrar el popup propio con la tecla Escape.
   * @private
   */
  #bindPopupEscape() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const overlay = document.getElementById('popupOverlay');
        if (overlay && !overlay.hidden) this.hidePopup();
      }
    });
  }

  /* =========================================================
     MODAL BOOTSTRAP (reemplazo de confirm + victoria/derrota)
     ========================================================= */

  /**
   * Abre el modal Bootstrap con título, HTML de cuerpo y un botón "confirmar".
   *   - Si se cierra por cualquier medio (botón X, backdrop, cancelar) → no se confirma.
   *   - Si se pulsa el botón primario → se llama onConfirm, modal se cierra.
   *
   * @param {string} title
   * @param {string|HTMLElement} bodyHTML
   * @param {function():void|Promise<void>} [onConfirm] Callback al pulsar "confirmar".
   * @param {{confirmLabel?: string, cancelLabel?: string, showCancel?: boolean, extraButtons?: Array<{label:string, classes?:string, onClick:function(modal:any):void}>}} [opts]
   * @returns {object} Instancia del modal Bootstrap (para control manual).
   */
  showModal(title, bodyHTML, onConfirm, opts = {}) {
    const modalEl = document.getElementById('gameModal');
    if (!modalEl) return null;

    const label    = document.getElementById('gameModalLabel');
    const body     = document.getElementById('gameModalBody');
    const footer   = document.getElementById('gameModalFooter');
    const bootstrap = window.bootstrap && window.bootstrap.Modal;
    if (!bootstrap) return null;

    if (label) label.textContent = title || '';
    if (body) {
      body.innerHTML = '';
      if (bodyHTML instanceof HTMLElement) body.appendChild(bodyHTML);
      else body.innerHTML = String(bodyHTML ?? '');
    }

    footer.innerHTML = '';

    if (opts.showCancel !== false) {
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'btn btn-outline-secondary game-btn game-btn-outline';
      cancel.textContent = opts.cancelLabel || 'Cancelar';
      cancel.setAttribute('data-bs-dismiss', 'modal');
      footer.appendChild(cancel);
    }

    (opts.extraButtons || []).forEach(b => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = b.classes || 'btn btn-secondary game-btn';
      btn.textContent = b.label;
      btn.addEventListener('click', () => {
        if (typeof b.onClick === 'function') {
          const instance = bootstrap.getInstance(modalEl);
          b.onClick(instance);
        }
      });
      footer.appendChild(btn);
    });

    if (typeof onConfirm === 'function') {
      const confirm = document.createElement('button');
      confirm.type = 'button';
      confirm.className = 'btn btn-primary game-btn game-btn-accent';
      confirm.textContent = opts.confirmLabel || 'Confirmar';
      confirm.addEventListener('click', async () => {
        try {
          await onConfirm();
        } finally {
          const instance = bootstrap.getInstance(modalEl);
          if (instance) instance.hide();
        }
      });
      footer.appendChild(confirm);
    }

    const modal = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
    modal.show();
    return modal;
  }

  /**
   * Cierra el modal abierto (si hay alguno).
   */
  hideModal() {
    const modalEl = document.getElementById('gameModal');
    if (!modalEl) return;
    const instance = window.bootstrap?.Modal?.getInstance(modalEl);
    if (instance) instance.hide();
  }
}
