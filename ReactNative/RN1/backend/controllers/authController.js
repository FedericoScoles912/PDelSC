import bcrypt from 'bcrypt';
import { UserModel } from '../models/userModel.js';

/**
 * Controlador de Autenticación
 */
export const AuthController = {
  /**
   * Procesa el inicio de sesión comparando la contraseña con el hash bcrypt.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async login(req, res, next) {
    try {
      const { usuario, password } = req.body;

      // 1. Buscar usuario por username o email
      const user = await UserModel.findByUsuarioOrCorreo(usuario);

      if (!user) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Credenciales inválidas',
        });
      }

      // 2. Comparar la contraseña en texto plano con el hash almacenado
      const passwordValida = await bcrypt.compare(password, user.password_hash);

      if (!passwordValida) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Credenciales inválidas',
        });
      }

      // 3. Respuesta exitosa omitiendo el hash de la contraseña
      return res.status(200).json({
        ok: true,
        usuario: {
          id: user.id,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Endpoint de salud del servidor (Health Check)
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async health(req, res) {
    return res.status(200).json({
      ok: true,
      status: 'UP',
      servicio: 'API de Acceso de Usuarios',
      timestamp: new Date().toISOString(),
    });
  },
};
