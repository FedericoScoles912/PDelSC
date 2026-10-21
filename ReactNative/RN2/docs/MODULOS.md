# Catálogo de Módulos de Hardware y Sensores

En este documento se detalla cada componente de hardware integrado en **Sensores Hub**, especificando la librería oficial de Expo empleada, permisos requeridos, APIs principales, ejemplos de código e impactos por plataforma.

---

## 1. Tabla Resumen de Compatibilidad por Plataforma

| Módulo / Herramienta | Librería Expo | Android | iOS | Web |
| :--- | :--- | :---: | :---: | :---: |
| **Cámara (Fotos y Flash)** | `expo-camera` (`CameraView`) | Completo | Completo | Limitado (solo visor) |
| **Lector de Códigos (QR/Barras)** | `expo-camera` (`BarcodeScanner`) | Completo | Completo | Limitado por navegador |
| **GPS y Ubicación** | `expo-location` | Completo (GPS + Red) | Completo (CoreLocation) | HTML5 Geolocation |
| **Geocodificación Inversa** | `expo-location` (`reverseGeocodeAsync`) | Completo | Completo | Requiere API Key |
| **Acelerómetro** | `expo-sensors` (`Accelerometer`) | Completo | Completo | Emulado / No soportado |
| **Giroscopio** | `expo-sensors` (`Gyroscope`) | Completo | Completo | Emulado / No soportado |
| **Magnetómetro (Brújula)** | `expo-sensors` (`Magnetometer`) | Completo | Completo | No soportado |
| **Autenticación Biométrica** | `expo-local-authentication` | Huella / Rostro | Face ID / Touch ID | No soportado |
| **Respuesta Háptica** | `expo-haptics` | Completo | Completo | No soportado |
| **Nivel y Estado de Batería** | `expo-battery` | Completo | Completo | Solo CA simulado |
| **Diagnóstico de Red** | `expo-network` | Completo | Completo | Online / Offline básico |
| **Portapapeles del Sistema** | `expo-clipboard` | Completo | Completo | Clipboard API moderna |

---

## 2. Detalle de Cada Módulo

### 2.1. Cámara (`expo-camera`)
- **Librería:** `expo-camera` (componente moderno `CameraView`).
- **Permisos:** `CAMERA` (Android), `NSCameraUsageDescription` (iOS).
- **APIs Utilizadas:**
  - `<CameraView facing={facing} enableTorch={torch} ref={cameraRef} />`
  - `takePictureAsync({ quality: 0.85 })`
- **Ejemplo de Código:**
```typescript
import { CameraView } from 'expo-camera';

<CameraView
  ref={cameraRef}
  style={{ flex: 1 }}
  facing="back"
  enableTorch={false}
/>
```
- **Limitaciones:** En Web no se puede controlar la linterna ni enfocar hardware avanzado.

---

### 2.2. Lector de Códigos QR y de Barras (`expo-camera`)
- **Librería:** `expo-camera` (`barcodeScannerSettings` y `onBarcodeScanned`).
- **Permisos:** Mismo permiso de cámara.
- **Tipos de códigos soportados:** QR, EAN-13, EAN-8, Code128, Code39, UPC-A, UPC-E.
- **Ejemplo de Código:**
```typescript
<CameraView
  barcodeScannerSettings={{
    barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'],
  }}
  onBarcodeScanned={isScanning ? handleScan : undefined}
/>
```

---

### 2.3. Ubicación y GPS (`expo-location`)
- **Librería:** `expo-location`.
- **Permisos:** `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` (Android), `NSLocationWhenInUseUsageDescription` (iOS).
- **APIs Utilizadas:**
  - `Location.getForegroundPermissionsAsync()` / `requestForegroundPermissionsAsync()`
  - `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })`
  - `Location.watchPositionAsync({ accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 1 }, callback)`
  - `Location.reverseGeocodeAsync({ latitude, longitude })`
- **Ejemplo de Código:**
```typescript
import * as Location from 'expo-location';

const sub = await Location.watchPositionAsync(
  { accuracy: Location.Accuracy.High, timeInterval: 2000 },
  (loc) => console.log(loc.coords.latitude, loc.coords.longitude)
);
// Al desmontar pantalla:
sub.remove();
```

---

### 2.4. Sensores de Movimiento (`expo-sensors`)
- **Librería:** `expo-sensors` (`Accelerometer`, `Gyroscope`, `Magnetometer`).
- **Permisos:** No requieren permiso explícito en tiempo de ejecución en Android/iOS (acceso de sensor normal).
- **APIs Utilizadas:**
  - `Accelerometer.setUpdateInterval(ms)` / `Accelerometer.addListener(cb)`
  - `Gyroscope.setUpdateInterval(ms)` / `Gyroscope.addListener(cb)`
  - `Magnetometer.setUpdateInterval(ms)` / `Magnetometer.addListener(cb)`
- **Detección de Sacudida (Shake):**
  Calcula la magnitud del vector resultante:
  $$\text{Magnitud} = \sqrt{x^2 + y^2 + z^2}$$
  Si supera el umbral de `1.8g`, dispara la vibración y notificación.
- **Brújula Magnética:**
  $$\theta = \text{atan2}(-y, x) \times \left(\frac{180}{\pi}\right)$$
  Se normaliza en el rango de $0^\circ$ a $360^\circ$ para indicar el rumbo geográfico.

---

### 2.5. Autenticación Biométrica (`expo-local-authentication`)
- **Librería:** `expo-local-authentication`.
- **Permisos:** `USE_BIOMETRIC`, `USE_FINGERPRINT` (Android), `NSFaceIDUsageDescription` (iOS).
- **APIs Utilizadas:**
  - `LocalAuthentication.hasHardwareAsync()`: detecta presencia física de lector.
  - `LocalAuthentication.isEnrolledAsync()`: verifica si existen registros dactilares/faciales.
  - `LocalAuthentication.authenticateAsync({ promptMessage, fallbackLabel })`
- **Degradación Elegante:** Si la plataforma es Web o carece de hardware, la app no se bloquea ni lanza errores no controlados; muestra una explicación clara mediante `PopupModal`.

---

### 2.6. Módulos Adicionales (Batería, Háptica, Red, Portapapeles)
- **`expo-battery`:** `getBatteryLevelAsync()`, `getBatteryStateAsync()`, `isLowPowerModeEnabledAsync()`.
- **`expo-haptics`:** `impactAsync(Light | Medium | Heavy)` y `notificationAsync(Success | Warning | Error)`.
- **`expo-network`:** `getNetworkStateAsync()` (determina Wi-Fi, 4G/5G, Ethernet o Sin Conexión).
- **`expo-clipboard`:** `setStringAsync(text)` y `getStringAsync()`.
- **`expo-device`:** `brand`, `manufacturer`, `modelName`, `osName`, `osVersion`, `isDevice`.
