# Política y Gestión de Permisos en Sensores Hub

Este documento detalla los permisos requeridos por la aplicación, la justificación de uso para el usuario final y las tiendas de aplicaciones (Google Play / App Store), y el flujo reactivo implementado mediante el hook unificado `usePermission`.

---

## 1. Tabla de Permisos Declarados

| Permiso Android | Clave iOS Info.plist | Módulo Asociado | Justificación para el Usuario |
| :--- | :--- | :--- | :--- |
| `android.permission.CAMERA` | `NSCameraUsageDescription` | Cámara y Escáner QR | Permite al usuario capturar fotografías, ver la vista previa y escanear códigos QR y de barras. |
| `android.permission.ACCESS_FINE_LOCATION` | `NSLocationWhenInUseUsageDescription` | GPS y Ubicación | Permite obtener coordenadas exactas del receptor GPS del dispositivo para mostrar latitud, longitud y altitud. |
| `android.permission.ACCESS_COARSE_LOCATION` | N/A | GPS y Ubicación | Provee una estimación de posición mediante antenas celulares y redes Wi-Fi cuando el GPS está en modo ahorro. |
| `android.permission.USE_BIOMETRIC` | `NSFaceIDUsageDescription` | Biometría | Permite interactuar con el sensor biométrico seguro (lector de huellas o Face ID) para validar la identidad. |
| `android.permission.USE_FINGERPRINT` | N/A | Biometría | Compatibilidad con dispositivos Android con API de huella anterior a Android 9. |
| `android.permission.VIBRATE` | N/A | Sensores y Háptica | Permite accionar el actuador de vibración en sacudidas de sensores y respuesta de escaneo. |

---

## 2. Declaración en la Configuración del Proyecto (`app.json`)

Para que el compilador de **Expo EAS** genere el archivo `AndroidManifest.xml` e `Info.plist` con los permisos correctos, están declarados de la siguiente forma:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.USE_BIOMETRIC",
        "android.permission.USE_FINGERPRINT",
        "android.permission.VIBRATE"
      ]
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Permite a Sensores Hub acceder a la cámara para capturar fotos y escanear códigos."
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Permite a Sensores Hub acceder a tu ubicación en tiempo real para lecturas GPS."
        }
      ],
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Permite a Sensores Hub validar tu identidad mediante biometría."
        }
      ]
    ]
  }
}
```

---

## 3. Flujo Reactivo de Solicitud (`usePermission`)

La aplicación nunca presupone que un permiso fue otorgado ni deja la interfaz en blanco. El ciclo de vida de un permiso sigue este orden:

```
[Pantalla Montada] 
       │
       ▼
[usePermission.checkPermission()] ─── ¿Concedido? ──► [Renderiza Herramienta]
       │ No / Indeterminado
       ▼
[Muestra PermissionBanner en pantalla]
       │
       ├─► Botón "Solicitar Permiso" ──► Diálogo nativo del S.O.
       │                                     │
       │                                     ├─ Concedido ──► Actualiza estado reactivo
       │                                     └─ Denegado ──► Muestra Pop-up explicativo
       │
       └─► Botón "Abrir Ajustes" ──► Linking.openSettings()
```

### Manejo de Denegación Permanente:
Si el usuario seleccionó "No volver a preguntar" en Android, el método `requestPermission()` detecta `canAskAgain === false` y despliega un `PopupModal` ofreciendo un acceso directo hacia los ajustes de la aplicación (`Linking.openSettings()`).
