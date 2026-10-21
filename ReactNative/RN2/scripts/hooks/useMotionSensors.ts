import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { MotionSensorsState, Sensor3DData } from '../types/sensors';
import { SHAKE_THRESHOLD, SENSOR_UPDATE_INTERVALS } from '../utils/constants';

interface SubscriptionLike {
  remove: () => void;
}

const empty3D: Sensor3DData = { x: 0, y: 0, z: 0 };

/**
 * Hook para monitorear acelerómetro, giroscopio y magnetómetro en tiempo real.
 * Incluye detección de sacudida (shake), cálculo de orientación (brújula) y control de frecuencia.
 */
export function useMotionSensors(isFocused = true): {
  state: MotionSensorsState;
  setIntervalMs: (ms: number) => void;
  toggleActive: () => void;
  pause: () => void;
  resume: () => void;
  isPlatformSupported: boolean;
} {
  const isPlatformSupported = Platform.OS !== 'web';

  const [accelerometer, setAccelerometer] = useState<Sensor3DData>(empty3D);
  const [gyroscope, setGyroscope] = useState<Sensor3DData>(empty3D);
  const [magnetometer, setMagnetometer] = useState<Sensor3DData>(empty3D);
  const [heading, setHeading] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [intervalMs, setIntervalMsState] = useState<number>(SENSOR_UPDATE_INTERVALS.NORMAL);

  const accSubRef = useRef<SubscriptionLike | null>(null);
  const gyroSubRef = useRef<SubscriptionLike | null>(null);
  const magSubRef = useRef<SubscriptionLike | null>(null);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastShakeTimeRef = useRef<number>(0);

  const unsubscribeAll = useCallback(() => {
    if (accSubRef.current) {
      accSubRef.current.remove();
      accSubRef.current = null;
    }
    if (gyroSubRef.current) {
      gyroSubRef.current.remove();
      gyroSubRef.current = null;
    }
    if (magSubRef.current) {
      magSubRef.current.remove();
      magSubRef.current = null;
    }
  }, []);

  const subscribeAll = useCallback((ms: number) => {
    if (!isPlatformSupported) return;

    unsubscribeAll();

    try {
      Accelerometer.setUpdateInterval(ms);
      Gyroscope.setUpdateInterval(ms);
      Magnetometer.setUpdateInterval(ms);

      accSubRef.current = Accelerometer.addListener((data) => {
        setAccelerometer(data);

        // Algoritmo de detección de sacudida (magnitud de aceleración instantánea)
        const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
        const now = Date.now();
        if (magnitude > SHAKE_THRESHOLD && now - lastShakeTimeRef.current > 1200) {
          lastShakeTimeRef.current = now;
          setIsShaking(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});

          if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
          shakeTimeoutRef.current = setTimeout(() => {
            setIsShaking(false);
          }, 1500);
        }
      });

      gyroSubRef.current = Gyroscope.addListener((data) => {
        setGyroscope(data);
      });

      magSubRef.current = Magnetometer.addListener((data) => {
        setMagnetometer(data);

        // Cálculo de orientación de brújula en grados [0 - 360]
        let angle = Math.atan2(-data.y, data.x) * (180 / Math.PI);
        if (angle < 0) {
          angle += 360;
        }
        setHeading(angle);
      });
    } catch {
      // Ignorar excepciones si los sensores no están presentes físicamente
    }
  }, [isPlatformSupported, unsubscribeAll]);

  const setIntervalMs = useCallback(
    (newInterval: number) => {
      setIntervalMsState(newInterval);
      if (isActive && isFocused && isPlatformSupported) {
        subscribeAll(newInterval);
      }
    },
    [isActive, isFocused, isPlatformSupported, subscribeAll]
  );

  const pause = useCallback(() => {
    setIsActive(false);
    unsubscribeAll();
  }, [unsubscribeAll]);

  const resume = useCallback(() => {
    setIsActive(true);
    if (isFocused && isPlatformSupported) {
      subscribeAll(intervalMs);
    }
  }, [intervalMs, isFocused, isPlatformSupported, subscribeAll]);

  const toggleActive = useCallback(() => {
    if (isActive) {
      pause();
    } else {
      resume();
    }
  }, [isActive, pause, resume]);

  useEffect(() => {
    if (isActive && isFocused && isPlatformSupported) {
      subscribeAll(intervalMs);
    } else {
      unsubscribeAll();
    }

    return () => {
      unsubscribeAll();
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, [isActive, isFocused, intervalMs, isPlatformSupported, subscribeAll, unsubscribeAll]);

  return {
    state: {
      accelerometer,
      gyroscope,
      magnetometer,
      heading,
      isShaking,
      isActive,
      intervalMs,
    },
    setIntervalMs,
    toggleActive,
    pause,
    resume,
    isPlatformSupported,
  };
}
