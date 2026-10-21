import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { ThemeMode } from '../types/theme';
import { ScanHistoryItem } from '../types/history';

/**
 * Servicio de almacenamiento persistente usando AsyncStorage.
 */
export const storageService = {
  /**
   * Obtiene la preferencia de tema guardada.
   */
  async getThemeMode(): Promise<ThemeMode> {
    try {
      const mode = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (mode === 'light' || mode === 'dark' || mode === 'system') {
        return mode;
      }
      return 'system';
    } catch {
      return 'system';
    }
  },

  /**
   * Guarda la preferencia de tema.
   */
  async setThemeMode(mode: ThemeMode): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    } catch {
      // Manejo silencioso de fallo en persistencia local
    }
  },

  /**
   * Obtiene el historial de códigos escaneados.
   */
  async getScanHistory(): Promise<ScanHistoryItem[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SCANNER_HISTORY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as ScanHistoryItem[];
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Agrega un nuevo ítem al historial (máximo 50 elementos para rendimiento).
   */
  async addScanHistoryItem(item: ScanHistoryItem): Promise<ScanHistoryItem[]> {
    try {
      const history = await this.getScanHistory();
      const updated = [item, ...history.filter(h => h.data !== item.data)].slice(0, 50);
      await AsyncStorage.setItem(STORAGE_KEYS.SCANNER_HISTORY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  /**
   * Limpia todo el historial de códigos escaneados.
   */
  async clearScanHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SCANNER_HISTORY);
    } catch {
      // Fallo silencioso
    }
  },
};
