export async function obtenerPuntuaciones() {
  console.log('🔍 obtenerPuntuaciones() llamado (API)');
  try {
    const respuesta = await fetch('/api/puntuaciones');
    const puntuaciones = await respuesta.json();
    console.log('✅ Puntuaciones obtenidas:', puntuaciones);
    return puntuaciones;
  } catch (error) {
    console.error('❌ Error al obtener puntuaciones:', error);
    return [];
  }
}

export async function guardarPuntuacion(nombre, puntaje, tiempo) {
  console.log('💾 guardarPuntuacion() llamado (API)');
  console.log('📋 Parámetros - nombre:', nombre, 'puntaje:', puntaje, 'tiempo:', tiempo);
  try {
    const nuevaPuntuacion = { nombre, puntaje, tiempo, fecha: Date.now() };
    const respuesta = await fetch('/api/puntuaciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevaPuntuacion)
    });
    const puntuaciones = await respuesta.json();
    console.log('✅ Puntuaciones guardadas:', puntuaciones);
    return puntuaciones;
  } catch (error) {
    console.error('❌ Error al guardar puntuación:', error);
    return [];
  }
}
