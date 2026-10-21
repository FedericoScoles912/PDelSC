import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';

/**
 * Servicio para operaciones de geolocalización, geocodificación inversa y mapas.
 */
export const locationService = {
  /**
   * Obtiene la dirección legible a partir de latitud y longitud.
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const places = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (places && places.length > 0) {
        const place = places[0];
        const parts = [
          place.street,
          place.streetNumber,
          place.district,
          place.city,
          place.region,
          place.country,
        ].filter(Boolean);

        return parts.length > 0 ? parts.join(', ') : 'Ubicación identificada sin dirección exacta';
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Abre la ubicación actual en la aplicación de mapas del sistema o navegador.
   */
  async openInMaps(latitude: number, longitude: number, label = 'Mi Ubicación'): Promise<boolean> {
    const encodedLabel = encodeURIComponent(label);
    const url = Platform.select({
      ios: `maps:0,0?q=${encodedLabel}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${encodedLabel})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return true;
      } else {
        const fallback = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        await Linking.openURL(fallback);
        return true;
      }
    } catch {
      const fallback = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      try {
        await Linking.openURL(fallback);
        return true;
      } catch {
        return false;
      }
    }
  },

  /**
   * Abre la pantalla de ajustes del sistema.
   */
  async openSettings(): Promise<void> {
    try {
      await Linking.openSettings();
    } catch {
      // Ignorar fallo si la plataforma no lo soporta
    }
  },
};
