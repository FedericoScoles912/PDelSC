export function validarNombre(nombre) {
  const regex = /^[a-zA-Z]{1,3}$/;
  return regex.test(nombre);
}
