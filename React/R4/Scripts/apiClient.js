const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

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
    })

    if (!response.ok) {
      throw new Error(`Error en la solicitud POST: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    throw error
  }
}
