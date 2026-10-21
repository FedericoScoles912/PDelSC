export interface Sensor3DData {
  x: number;
  y: number;
  z: number;
}

export interface MotionSensorsState {
  accelerometer: Sensor3DData;
  gyroscope: Sensor3DData;
  magnetometer: Sensor3DData;
  heading: number;
  isShaking: boolean;
  isActive: boolean;
  intervalMs: number;
}

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  address: string | null;
  timestamp: number | null;
  isTracking: boolean;
  isLoading: boolean;
}

export interface BatteryInfo {
  batteryLevel: number | null;
  batteryState: string;
  isLowPowerMode: boolean | null;
  isSupported: boolean;
}

export interface NetworkInfo {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  networkType: string;
}

export interface DeviceInfoState {
  brand: string | null;
  manufacturer: string | null;
  modelName: string | null;
  osName: string | null;
  osVersion: string | null;
  deviceType: string;
  isDevice: boolean;
}

export interface BiometricInfo {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: string[];
  isSupportedOnPlatform: boolean;
}
