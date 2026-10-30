/**
 * @file Tipo compartido para los nombres de iconos de Ionicons.
 * @module client/src/utils/iconos
 */

import { Ionicons } from '@expo/vector-icons';

/** Nombre válido de un icono del set Ionicons. */
export type NombreIcono = keyof typeof Ionicons.glyphMap;
