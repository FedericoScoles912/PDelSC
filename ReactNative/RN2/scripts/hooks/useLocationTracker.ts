import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { LocationData } from '../types/sensors';
import { locationService } from '../services/locationService';
import { clipboardService } from '../services/clipboardService';
import { formatCoordinate } from '../utils/formatters';
import { usePopup } from './usePopup';

export interface UseLocationTrackerResult {
  location: LocationData;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  refreshLocation: () => Promise<void>;
  openInMapApp: () => Promise<void>;
  copyCoordinates: () => Promise<void>;
}

const initialLocationState: LocationData = {
  latitude: null,
  longitude: null,
  altitude: null,
  accuracy: null,
  speed: null,
  heading: null,
  address: null,
  timestamp: null,
  isTracking: false,
  isLoading: false,
};

/**
 * Hook para gestionar lectura y seguimiento en tiempo real del GPS con geocodificación inversa.
 */
export function useLocationTracker(): UseLocationTrackerResult {
  const [location, setLocation] = useState<LocationData>(initialLocationState);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const { showPopup } = usePopup();

  const stopTracking = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setLocation((prev) => ({ ...prev, isTracking: false }));
  }, []);

  const updatePosition = useCallback(async (loc: Location.LocationObject) => {
    const { latitude, longitude, altitude, accuracy, speed, heading } = loc.coords;
    const address = await locationService.reverseGeocode(latitude, longitude);

    setLocation((prev) => ({
      ...prev,
      latitude,
      longitude,
      altitude,
      accuracy,
      speed,
      heading,
      address,
      timestamp: loc.timestamp,
      isLoading: false,
    }));
  }, []);

  const checkGpsServices = useCallback(async (): Promise<boolean> => {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        showPopup({
          type: 'warning',
          title: 'GPS Desactivado',
          message: 'Los servicios de ubicación del dispositivo están desactivados. Por favor actívalos en los ajustes.',
          actions: [
            { label: 'Entendido', variant: 'secondary' },
            { label: 'Ajustes', variant: 'primary', onPress: () => locationService.openSettings() },
          ],
        });
        return false;
      }
      return true;
    } catch {
      return true;
    }
  }, [showPopup]);

  const refreshLocation = useCallback(async () => {
    const gpsEnabled = await checkGpsServices();
    if (!gpsEnabled) return;

    setLocation((prev) => ({ ...prev, isLoading: true }));
    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await updatePosition(current);
    } catch (err) {
      setLocation((prev) => ({ ...prev, isLoading: false }));
      showPopup({
        type: 'error',
        title: 'Error de ubicación',
        message: 'No fue posible obtener la posición GPS actual. Comprueba la señal del dispositivo.',
      });
    }
  }, [checkGpsServices, updatePosition, showPopup]);

  const startTracking = useCallback(async () => {
    const gpsEnabled = await checkGpsServices();
    if (!gpsEnabled) return;

    if (subscriptionRef.current) {
      stopTracking();
    }

    setLocation((prev) => ({ ...prev, isLoading: true, isTracking: true }));

    try {
      // Tomar una lectura inicial rápida
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await updatePosition(initial);

      // Iniciar suscripción periódica
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (loc) => {
          updatePosition(loc);
        }
      );

      subscriptionRef.current = sub;
      setLocation((prev) => ({ ...prev, isTracking: true, isLoading: false }));
    } catch (err) {
      stopTracking();
      setLocation((prev) => ({ ...prev, isTracking: false, isLoading: false }));
      showPopup({
        type: 'error',
        title: 'Fallo al iniciar GPS',
        message: 'Ocurrió un problema al suscribirse a las actualizaciones de ubicación en tiempo real.',
      });
    }
  }, [checkGpsServices, stopTracking, updatePosition, showPopup]);

  const openInMapApp = useCallback(async () => {
    if (location.latitude === null || location.longitude === null) {
      showPopup({
        type: 'warning',
        title: 'Ubicación no disponible',
        message: 'Primero debes obtener la posición GPS antes de abrir mapas.',
      });
      return;
    }

    const success = await locationService.openInMaps(location.latitude, location.longitude);
    if (!success) {
      showPopup({
        type: 'error',
        title: 'Error al abrir mapas',
        message: 'No se encontró una aplicación de mapas compatible para abrir las coordenadas.',
      });
    }
  }, [location.latitude, location.longitude, showPopup]);

  const copyCoordinates = useCallback(async () => {
    if (location.latitude === null || location.longitude === null) {
      showPopup({
        type: 'warning',
        title: 'Sin coordenadas',
        message: 'No hay coordenadas disponibles para copiar en este momento.',
      });
      return;
    }

    const text = `${formatCoordinate(location.latitude)}, ${formatCoordinate(location.longitude)}`;
    await clipboardService.copyText(text);

    showPopup({
      type: 'success',
      title: 'Coordenadas copiadas',
      message: `Se copiaron las coordenadas (${text}) al portapapeles.`,
    });
  }, [location.latitude, location.longitude, showPopup]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, []);

  return {
    location,
    startTracking,
    stopTracking,
    refreshLocation,
    openInMapApp,
    copyCoordinates,
  };
}
