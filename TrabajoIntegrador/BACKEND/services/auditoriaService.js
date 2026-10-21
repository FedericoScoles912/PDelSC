/**
 * auditoriaService.js
 * Consulta de la bitácora de auditoría.
 */
import * as repo from '../repositories/auditoriaRepo.js';

export const listar = (filtros, paginacion) => repo.list({ ...filtros, ...paginacion });

export default { listar };
