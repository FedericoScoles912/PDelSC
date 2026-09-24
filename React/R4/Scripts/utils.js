export const validateEmail = (value) => {
  return typeof value === 'string' && /\S+@\S+\.\S+/.test(value)
}

export const validateNotEmpty = (value) => {
  return typeof value === 'string' && value.trim().length > 0
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
  })
}
