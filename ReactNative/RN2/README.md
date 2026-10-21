# Sensores Hub 📱🔬

**Sensores Hub** es una aplicación móvil moderna, robusta y completamente tipada en **TypeScript estricto** construida con **React Native** y **Expo (SDK 52)**. La aplicación reúne y demuestra de forma interactiva las herramientas y sensores de hardware del dispositivo móvil, adaptándose con elegancia desde pantallas pequeñas hasta monitores de escritorio (1920x1080).

---

## 🚀 Funcionalidades Principales

1. **Dashboard Principal:**
   - Resumen en tiempo real de batería, tipo de red y modelo de hardware.
   - Grilla responsiva de tarjetas con estado de permisos (Concedido / Denegado / Pendiente) y acceso directo a cada módulo.

2. **Cámara Fotográfica:**
   - Visor en vivo a través de `expo-camera` (`CameraView`).
   - Captura de fotos, alternancia de lente (frontal/trasera) y linterna on/off.
   - Galería de fotos tomadas durante la sesión con visor a pantalla completa.

3. **Lector de Códigos QR y de Barras:**
   - Escaneo en tiempo real (QR, EAN-13, EAN-8, Code128, Code39, etc.).
   - Marco de mira visual con respuesta háptica al detectar un código.
   - Prevención de duplicados (debounce).
   - Modal interactivo (`PopupModal`) para copiar contenido o abrir enlaces en el navegador.
   - Historial persistente en `AsyncStorage` con opción de borrado.

4. **GPS y Ubicación:**
   - Posicionamiento en vivo mediante `watchPositionAsync` con control de inicio y pausa.
   - Lecturas de latitud, longitud, altitud, precisión, velocidad y rumbo.
   - Geocodificación inversa para mostrar la dirección postal estimada.
   - Integración con aplicaciones de mapas del sistema (Google Maps / Apple Maps) mediante `Linking`.

5. **Sensores de Movimiento:**
   - Monitoreo en vivo de Acelerómetro, Giroscopio y Magnetómetro con barras visuales de balance centradas.
   - Selector interactivo de intervalo de actualización (100 ms, 500 ms, 1000 ms).
   - Detección de sacudida (*Shake*) con alerta y vibración háptica.
   - Brújula digital visual orientada en tiempo real según el norte magnético.
   - Cancelación limpia de suscripciones al desmontar o perder foco.

6. **Autenticación Biométrica:**
   - Detección de hardware disponible (huella dactilar, reconocimiento facial, iris).
   - Verificación de credenciales registradas.
   - Desafío de autenticación biométrica segura con retroalimentación vía pop-up.

7. **Diagnósticos Extras:**
   - Monitoreo de batería (nivel de carga, estado, modo ahorro).
   - Estado de red (Wi-Fi, datos móviles, conectividad a Internet).
   - Información del fabricante, modelo y versión de sistema operativo.
   - Pruebas interactivas de vibración háptica (Ligera, Media, Fuerte, Éxito, Aviso, Error).
   - Diagnóstico del portapapeles del sistema (lectura y copiado de prueba).

8. **Ajustes y Personalización:**
   - Selector de tema visual: Modo Claro, Modo Oscuro o Seguir al Sistema (con persistencia).
   - Panel de control de permisos con revalidación y acceso directo a los ajustes de la app.

---

## 🛠️ Stack Tecnológico

- **Núcleo:** React Native 0.76 + Expo SDK 52 + TypeScript estricto (`noImplicitAny`, sin uso de `any`).
- **Navegación:** Adaptativa (Barra de pestañas inferior `TabBar` en móviles/tablets y barra lateral fija `Sidebar` en pantallas de escritorio >= 992px).
- **Módulos de Hardware Oficiales de Expo:**
  - `expo-camera` (`CameraView`)
  - `expo-location`
  - `expo-sensors` (`Accelerometer`, `Gyroscope`, `Magnetometer`)
  - `expo-local-authentication`
  - `expo-haptics`, `expo-battery`, `expo-network`, `expo-device`, `expo-clipboard`
- **Persistencia:** `@react-native-async-storage/async-storage`.
- **Diseño Atómico:** Metodología Atomic Design (Átomos → Moléculas → Organismos → Pantallas).
- **Paleta de Colores Relajada:** Tonos otoñales (Crema, Terracota, Ocre, Oliva, Café tostado, Ámbar) sin blancos o negros puros, cumpliendo con accesibilidad WCAG AA.
- **Sistema de Modales:** `PopupContext` y `PopupModal` reutilizable (cero llamadas a `alert()` o `Alert.alert()`).

---

## 📂 Estructura del Proyecto

```
/
├── package.json
├── .gitignore
├── README.md
├── App.tsx
├── app.json
├── eas.json
├── tsconfig.json
├── babel.config.js
├── /styles
│   └── theme.ts
├── /assets
│   ├── icon.png
│   ├── splash.png
│   ├── adaptive-icon.png
│   └── favicon.png
├── /docs
│   ├── MODULOS.md
│   ├── PERMISOS.md
│   ├── ARQUITECTURA.md
│   ├── TEMAS.md
│   └── BUILD_APK.md
└── /scripts
    ├── /types
    │   ├── theme.ts
    │   ├── popup.ts
    │   ├── permissions.ts
    │   ├── sensors.ts
    │   ├── history.ts
    │   ├── navigation.ts
    │   └── index.ts
    ├── /utils
    │   ├── constants.ts
    │   ├── formatters.ts
    │   ├── validators.ts
    │   └── index.ts
    ├── /services
    │   ├── storageService.ts
    │   ├── locationService.ts
    │   ├── biometricService.ts
    │   ├── clipboardService.ts
    │   └── index.ts
    ├── /context
    │   ├── ThemeContext.tsx
    │   └── PopupContext.tsx
    ├── /hooks
    │   ├── useBreakpoint.ts
    │   ├── useTheme.ts
    │   ├── usePopup.ts
    │   ├── usePermission.ts
    │   ├── useCameraTools.ts
    │   ├── useScanner.ts
    │   ├── useLocationTracker.ts
    │   ├── useMotionSensors.ts
    │   ├── useBiometrics.ts
    │   ├── useDeviceInfo.ts
    │   └── index.ts
    ├── /components
    │   ├── /atoms
    │   │   ├── Text.tsx
    │   │   ├── Icon.tsx
    │   │   ├── Button.tsx
    │   │   ├── Spinner.tsx
    │   │   ├── Badge.tsx
    │   │   └── index.ts
    │   ├── /molecules
    │   │   ├── DataRow.tsx
    │   │   ├── SensorValue.tsx
    │   │   ├── PermissionBanner.tsx
    │   │   ├── ThemeToggle.tsx
    │   │   ├── FeatureCard.tsx
    │   │   └── index.ts
    │   ├── /organisms
    │   │   ├── Header.tsx
    │   │   ├── CameraControls.tsx
    │   │   ├── SensorPanel.tsx
    │   │   ├── HistoryList.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── TabBar.tsx
    │   │   └── index.ts
    │   ├── /feedback
    │   │   └── PopupModal.tsx
    │   └── /layout
    │       ├── Container.tsx
    │       ├── Row.tsx
    │       ├── Col.tsx
    │       ├── ScreenWrapper.tsx
    │       └── index.ts
    ├── /navigation
    │   ├── AppNavigator.tsx
    │   └── types.ts
    └── /screens
        ├── DashboardScreen.tsx
        ├── CameraScreen.tsx
        ├── ScannerScreen.tsx
        ├── LocationScreen.tsx
        ├── MotionScreen.tsx
        ├── BiometricScreen.tsx
        ├── ExtrasScreen.tsx
        └── SettingsScreen.tsx
```

---

## 💻 Requisitos e Instalación

### Requisitos Previos:
- **Node.js** v18 o superior.
- **Expo Go** instalado en tu celular físico (disponible en Google Play Store y App Store) o emulador de Android.
- Cuenta en [expo.dev](https://expo.dev) para compilar con EAS.

### Instalación de Dependencias:
Clona o ingresa al directorio del proyecto y ejecuta:

```bash
npm install
```

---

## 🏃‍♂️ Ejecución en Desarrollo

### Iniciar servidor de desarrollo de Expo:
```bash
npx expo start
```
- Se mostrará un código QR en la consola. Escanéalo con la aplicación **Expo Go** en Android o con la cámara en iOS.

### Ejecutar directamente en navegador Web:
```bash
npm run web
# o bien: npx expo start --web
```

### Ejecutar directamente en emulador Android:
```bash
npm run android
# o bien: npx expo start --android
```

---

## 📦 Compilación del archivo .APK con Expo EAS

El proyecto cuenta con el perfil `preview` preconfigurado en `eas.json` para generar el instalador APK directamente:

```bash
# 1. Instalar la CLI de EAS (si no la tienes instalada)
npm install -g eas-cli

# 2. Iniciar sesión con tu cuenta de Expo
eas login

# 3. Compilar el APK en la nube de Expo
npm run build:apk
# (Equivale a: eas build -p android --profile preview)
```

Al terminar el proceso en la nube, la consola te mostrará el enlace y código QR de descarga del `.apk` para instalarlo en tu teléfono.

Consulta la guía detallada paso a paso en [BUILD_APK.md](file:///c:/Users/fedes/OneDrive/Documentos/GitHub/PDelSC/ReactNative/RN2/docs/BUILD_APK.md).

---

## ❓ Solución de Problemas Comunes

1. **"Camera or Location permission not granted"**:
   - Presiona sobre el botón "Abrir Ajustes" dentro del banner de la pantalla para otorgar el permiso en Android/iOS.
2. **"Biometrics not supported on Web"**:
   - La API de biometría requiere un dispositivo físico. Al probar en web, la app muestra un aviso informativo de compatibilidad sin fallar.
3. **"Network state not found"**:
   - Asegúrate de haber otorgado los permisos requeridos en el dispositivo y de contar con conexión activa.
