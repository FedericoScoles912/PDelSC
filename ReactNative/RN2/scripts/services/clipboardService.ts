import * as Clipboard from 'expo-clipboard';

/**
 * Servicio para manipular el portapapeles del dispositivo de manera segura.
 */
export const clipboardService = {
  /**
   * Copia un texto al portapapeles del sistema.
   */
  async copyText(text: string): Promise<boolean> {
    try {
      await Clipboard.setStringAsync(text);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Obtiene el texto actual almacenado en el portapapeles.
   */
  async getClipboardText(): Promise<string> {
    try {
      return await Clipboard.getStringAsync();
    } catch {
      return '';
    }
  },

  /**
   * Verifica si el portapapeles contiene texto.
   */
  async hasText(): Promise<boolean> {
    try {
      return await Clipboard.hasStringAsync();
    } catch {
      return false;
    }
  },
};
