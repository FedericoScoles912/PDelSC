/**
 * @class WordFetcher
 * @description Obtiene una palabra aleatoria desde una API pública.
 *   Primero intenta usar una API en español (random-word-api con lang=es).
 *   Si falla, intenta Datamuse en español.
 *   Como último recurso, usa un array LOCAL de más de 50 palabras como fallback
 *   y notifica al consumidor que se usó el respaldo.
 *   El método fetchWord() siempre devuelve { word, category, fallback?: true }.
 *
 * @example
 *   const fetcher = new WordFetcher();
 *   const { word, category } = await fetcher.fetchWord();
 *   // → { word: "BOSQUE", category: "General" }
 */
export class WordFetcher {

  /**
   * Array de palabras de respaldo (fallback) en español.
   * Mínimo 50 palabras, de distintas categorías temáticas.
   * @type {string[]}
   * @private
   */
  #fallbackWords = [
    'BOSQUE', 'CIELO', 'PLAYA', 'MONTANA', 'RIO', 'TIERRA', 'FUEGO', 'AGUA',
    'AIRE', 'VIENTO', 'FLOR', 'ARBOL', 'FRUTA', 'VERDURA', 'LEON', 'TIGRE',
    'ELEFANTE', 'CABALLO', 'PERRO', 'GATO', 'PAJARO', 'PESCADO', 'LIBRO',
    'ESCUELA', 'MAESTRO', 'ALUMNO', 'MUSICA', 'GUITARRA', 'PIANO', 'CANCION',
    'CIUDAD', 'CALLE', 'CASA', 'EDIFICIO', 'COCINA', 'CUARTO', 'COMIDA',
    'BEBIDA', 'CAFE', 'TE', 'JARDIN', 'SOL', 'LUNA', 'ESTRELLA', 'NOCHE',
    'DIA', 'VERANO', 'INVIERNO', 'PRIMAVERA', 'OTOÑO', 'LAPIZ', 'PAPEL',
    'VENTANA', 'PUERTA', 'ESPEJO', 'RELOJ', 'ZAPATO', 'ROPA', 'SOMBRERO',
    'BOLSO', 'DINERO', 'BANCO', 'TRABAJO', 'VACACIONES', 'CARNAVAL',
    'FUTBOL', 'TENIS', 'NATACION', 'CINE', 'TEATRO', 'PINTURA', 'DIBUJO'
  ];

  /**
   * Categorías asociadas a grupos de palabras para darle contexto.
   * @type {Array<{category:string, words:string[]}>}
   * @private
   */
  #wordCategories = [
    { category: 'Naturaleza', words: ['BOSQUE','CIELO','PLAYA','MONTANA','RIO','TIERRA','FUEGO','AGUA','AIRE','VIENTO','FLOR','ARBOL','FRUTA','VERDURA','SOL','LUNA','ESTRELLA','NOCHE','DIA','VERANO','INVIERNO','PRIMAVERA','OTOÑO','JARDIN'] },
    { category: 'Animales',   words: ['LEON','TIGRE','ELEFANTE','CABALLO','PERRO','GATO','PAJARO','PESCADO'] },
    { category: 'Educación',  words: ['LIBRO','ESCUELA','MAESTRO','ALUMNO','LAPIZ','PAPEL'] },
    { category: 'Música',     words: ['MUSICA','GUITARRA','PIANO','CANCION'] },
    { category: 'Ciudad',     words: ['CIUDAD','CALLE','CASA','EDIFICIO','COCINA','CUARTO','VENTANA','PUERTA','ESPEJO','RELOJ'] },
    { category: 'Vestimenta', words: ['ZAPATO','ROPA','SOMBRERO','BOLSO'] },
    { category: 'Deportes',   words: ['FUTBOL','TENIS','NATACION'] },
    { category: 'Arte',       words: ['CINE','TEATRO','PINTURA','DIBUJO'] }
  ];

  /**
   * Devuelve una palabra aleatoria del array de fallback junto con su categoría.
   * @returns {{ word: string, category: string }}
   * @private
   */
  #pickLocal() {
    const word = this.#fallbackWords[Math.floor(Math.random() * this.#fallbackWords.length)];
    const cat = this.#wordCategories.find(c => c.words.includes(word));
    return { word, category: cat ? cat.category : 'General' };
  }

  /**
   * Intenta obtener UNA palabra desde random-word-api con un rango de longitud.
   * Si falla (red, timeout, respuesta no válida), rechaza la promesa.
   *
   * @param {number} min Longitud mínima deseada.
   * @param {number} max Longitud máxima deseada.
   * @returns {Promise<string>} Palabra en mayúsculas.
   * @throws {Error} Si la API no responde o el formato es incorrecto.
   * @private
   */
  async #fetchRandomWordApi(min = 5, max = 10) {
    const len = Math.floor(Math.random() * (max - min + 1)) + min;
    const url = `https://random-word-api.vercel.app/api?words=1&length=${len}&lang=es`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);

    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'string') {
        throw new Error('Formato inválido');
      }
      const w = data[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      if (!/^[A-ZÑ]{2,}$/.test(w)) throw new Error('Palabra no válida');
      return w;
    } finally {
      clearTimeout(t);
    }
  }

  /**
   * Intento secundario: Datamuse (palabras similares). No siempre provee una
   * palabra directa, por lo que sólo lo usamos como fallback breve.
   * @returns {Promise<string>}
   * @throws {Error}
   * @private
   */
  async #fetchDatamuse() {
    const letters = 5 + Math.floor(Math.random() * 4);
    const pattern = '?'.repeat(letters);
    const url = `https://api.datamuse.com/words?sp=${pattern}&max=50&lang=es`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Sin resultados');
    const valid = data
      .map(o => (o.word || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase())
      .filter(w => /^[A-ZÑ]{4,}$/.test(w));
    if (valid.length === 0) throw new Error('Sin palabras válidas');
    return valid[Math.floor(Math.random() * valid.length)];
  }

  /**
   * Obtiene una palabra aleatoria con su categoría.
   * - Tries: random-word-api (ES) → Datamuse → array local.
   *
   * @async
   * @returns {Promise<{ word: string, category: string, fallback?: boolean }>}
   *   - word:     palabra en mayúsculas, sin tildes ni espacios.
   *   - category: categoría temática (si la API no provee una, "General").
   *   - fallback: true sólo si se usó el array local (permite al UI notificar).
   * @example
   *   const wf = new WordFetcher();
   *   const { word, category } = await wf.fetchWord();
   *   console.log(word, category); // "PLAYA", "Naturaleza"
   */
  async fetchWord() {
    try {
      const word = await this.#fetchRandomWordApi(5, 10);
      const cat = this.#wordCategories.find(c => c.words.includes(word));
      return { word, category: cat ? cat.category : 'General' };
    } catch (_) {
      try {
        const word = await this.#fetchDatamuse();
        const cat = this.#wordCategories.find(c => c.words.includes(word));
        return { word, category: cat ? cat.category : 'General' };
      } catch (__) {
        const local = this.#pickLocal();
        return { ...local, fallback: true };
      }
    }
  }
}
