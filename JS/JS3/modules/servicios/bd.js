const LS_KEY = 'trensnake_puntuaciones';

function getFromLocalStorage() {
  try {
    const data = localStorage.getItem(LS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error getting from localStorage:', e);
    return [];
  }
}

function saveToLocalStorage(puntuaciones) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(puntuaciones));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

export async function obtenerPuntuaciones() {
  console.log('🔍 obtenerPuntuaciones() llamado (API + LS)');
  
  // Try API first
  let apiScores = [];
  try {
    const respuesta = await fetch('/api/puntuaciones');
    if (respuesta.ok) {
      apiScores = await respuesta.json();
      console.log('✅ Puntuaciones obtenidas API:', apiScores);
    }
  } catch (error) {
    console.warn('⚠️ Error al obtener puntuaciones desde API:', error);
  }
  
  // Get local storage scores
  const lsScores = getFromLocalStorage();
  
  // Merge and deduplicate
  const allScoresMap = new Map();
  [...apiScores, ...lsScores].forEach(score => {
    const key = `${score.nombre}-${score.puntaje}-${score.tiempo}-${score.fecha}`;
    if (!allScoresMap.has(key)) {
      allScoresMap.set(key, score);
    }
  });
  
  const allScores = Array.from(allScoresMap.values()).sort((a, b) => {
    if (b.puntaje !== a.puntaje) {
      return b.puntaje - a.puntaje;
    }
    return a.tiempo - b.tiempo;
  });
  
  console.log('✅ Puntuaciones combinadas:', allScores);
  return allScores;
}

export async function guardarPuntuacion(nombre, puntaje, tiempo) {
  console.log('💾 guardarPuntuacion() llamado (API + LS)');
  console.log('📋 Parámetros - nombre:', nombre, 'puntaje:', puntaje, 'tiempo:', tiempo);
  const nuevaPuntuacion = { nombre, puntaje, tiempo, fecha: Date.now() };
  
  // Try API first
  let puntuaciones = [];
  try {
    const respuesta = await fetch('/api/puntuaciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevaPuntuacion)
    });
    if (respuesta.ok) {
      puntuaciones = await respuesta.json();
      console.log('✅ Puntuaciones guardadas en API:', puntuaciones);
    }
  } catch (error) {
    console.warn('⚠️ Error al guardar en API:', error);
  }
  
  // Also save to localStorage
  const lsScores = getFromLocalStorage();
  lsScores.push(nuevaPuntuacion);
  lsScores.sort((a, b) => {
    if (b.puntaje !== a.puntaje) {
      return b.puntaje - a.puntaje;
    }
    return a.tiempo - b.tiempo;
  });
  saveToLocalStorage(lsScores);
  console.log('✅ Puntuaciones guardadas en LocalStorage:', lsScores);
  
  // Return combined scores
  return puntuaciones.length > 0 ? puntuaciones : lsScores;
}
