const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const get = async (endpoint) => {
  try {
    const response = await fetch(BASE_URL + endpoint)

    if (!response.ok) {
      throw new Error(`Error en la solicitud GET: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    throw error
  }
}

export const post = async (endpoint, body) => {
  try {
    const response = await fetch(BASE_URL + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Error en la solicitud POST: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    throw error
  }
}

export const request = async (endpoint, method, body) => {
  const response = await fetch(BASE_URL + endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'No se pudo guardar el cambio.');
  return response.status === 204 ? null : response.json();
};
