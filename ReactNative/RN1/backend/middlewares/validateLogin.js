/**
 * Middleware para validar el cuerpo de la petición de login.
 * Comprueba que usuario y contraseña estén presentes y no sean strings vacíos.
 */
export function validateLogin(req, res, next) {
  const { usuario, password } = req.body;

  if (!usuario || typeof usuario !== 'string' || usuario.trim() === '') {
    return res.status(400).json({
      ok: false,
      mensaje: 'El nombre de usuario o correo electrónico es obligatorio.',
    });
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({
      ok: false,
      mensaje: 'La contraseña es obligatoria.',
    });
  }

  // Sanitizar trim para el identificador
  req.body.usuario = usuario.trim();
  next();
}
