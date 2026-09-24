import { useState, useEffect } from 'react'

export default function useApiData(endpoint) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      if (!endpoint) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
        const response = await fetch(baseUrl + endpoint)

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`)
        }

        const result = await response.json()

        if (mounted) {
          setData(result)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Error al obtener los datos')
          setData(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [endpoint])

  return { data, loading, error }
}
