/**
 * authController.js
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import * as response from '../utils/response.js';
import * as authService from '../services/authService.js';

const meta = (req) => ({ ip: req.ip, userAgent: req.headers['user-agent'] });

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register({ ...req.body, ...meta(req) });
  response.created(res, data);
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login({ ...req.body, ...meta(req) });
  response.ok(res, data);
});

export const social = asyncHandler(async (req, res) => {
  const data = await authService.loginSocial({ ...req.body, ...meta(req) });
  response.ok(res, data);
});

export const refresh = asyncHandler(async (req, res) => {
  const data = await authService.refresh({ refreshToken: req.body.refreshToken, ...meta(req) });
  response.ok(res, data);
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout({ refreshToken: req.body?.refreshToken });
  response.ok(res, { ok: true });
});

export const me = asyncHandler(async (req, res) => {
  response.ok(res, await authService.me(req.user.id));
});

export const changePassword = asyncHandler(async (req, res) => {
  response.ok(res, await authService.changePassword(req.user.id, req.body));
});

export default { register, login, social, refresh, logout, me, changePassword };
