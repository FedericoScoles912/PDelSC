# Guía Completa de Compilación de APK con Expo EAS

Esta guía describe el procedimiento paso a paso para generar un archivo instalable `.apk` para Android utilizando **Expo Application Services (EAS Build)** y probar la aplicación **Sensores Hub** directamente en tu celular físico.

---

## 1. Requisitos Previos

- **Node.js** (versión 18 o superior recomendada).
- **Cuenta en Expo**: Registrarse gratuitamente en [expo.dev](https://expo.dev) si aún no posees una.
- **Dispositivo Android**: Celular físico con Android 8.0 o superior con conexión a Internet.
- **Herramienta CLI de EAS**: Instalada globalmente.

---

## 2. Instalación de Herramientas y Login

Abre una terminal (PowerShell, Git Bash o CMD en Windows, o Terminal en macOS/Linux) y ejecuta:

```bash
# 1. Instalar la CLI oficial de EAS
npm install -g eas-cli

# 2. Iniciar sesión con tu cuenta de Expo
# (Este paso lo realiza el usuario de manera interactiva con sus credenciales de expo.dev)
eas login

# 3. Comprobar que la sesión esté activa
eas whoami
```

---

## 3. Configuración del Proyecto con EAS

Si es la primera vez que vas a compilar el proyecto en tu cuenta de Expo, vincula el proyecto:

```bash
eas build:configure
```

Selecciona la plataforma **Android** cuando el asistente lo pregunte. El archivo `eas.json` incluido en el proyecto ya cuenta con el perfil `preview` optimizado para generar un instalador APK independiente:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## 4. Compilación del APK en la Nube (Recomendado)

Para iniciar la compilación remota en los servidores de Expo sin necesidad de configurar Android Studio, SDK ni JDK localmente:

```bash
# Comando directo usando el perfil preview
eas build -p android --profile preview

# O alternativamente mediante el script configurado en package.json:
npm run build:apk
```

### Proceso de compilación:
1. EAS empaqueta el código fuente y las dependencias declaradas.
2. Sube el paquete seguro a los servidores de compilación de Expo.
3. Se generará un enlace web en la terminal para que puedas monitorear los registros de compilación en tiempo real.
4. Al finalizar (típicamente entre 5 y 10 minutos), la terminal te mostrará un **código QR** y una **URL de descarga directa** del archivo `.apk`.

---

## 5. Descarga e Instalación en el Dispositivo Móvil

1. **Escanear el QR o abrir el enlace**: Desde tu celular Android, abre la cámara o el navegador y navega hacia la URL generada por EAS.
2. **Descargar el archivo**: Descarga el archivo `SensoresHub-preview.apk`.
3. **Permitir instalación de fuentes desconocidas**:
   - Android solicitará autorización para instalar aplicaciones desde el navegador (Chrome, Firefox, etc.) o el explorador de archivos.
   - Ve a **Ajustes > Seguridad / Privacidad > Instalar aplicaciones desconocidas** y activa el permiso para la aplicación que descargó el archivo.
4. **Instalar y Abrir**: Presiona sobre el archivo descargado para completar la instalación y abre **Sensores Hub**.
5. **Comprobación de Sensores**:
   - Al abrir cada herramienta (Cámara, GPS, Biometría), acepta los permisos solicitados por el sistema operativo.

---

## 6. Alternativa: Compilación Local (Offline / Sin Cola en la Nube)

Si dispones de un entorno de desarrollo completo con Linux o macOS (o WSL2 en Windows) con Android SDK, Java JDK 17 y variables de entorno configuradas (`ANDROID_HOME`, `JAVA_HOME`), puedes compilar localmente:

```bash
eas build -p android --profile preview --local
```

> **Nota:** La compilación local requiere una máquina con al menos 16 GB de RAM y consume almacenamiento considerable por el toolchain nativo de Android Gradle.

---

## 7. Errores Comunes y Soluciones

### Error: "Invalid credentials / Not logged in"
- **Causa:** No se ha ejecutado `eas login` o la sesión expiró.
- **Solución:** Ejecuta `eas login` e introduce tu usuario y contraseña de Expo.

### Error: "Package name already exists on Google Play"
- **Causa:** El identificador `com.sensoreshub.app` en `app.json` entra en conflicto o deseas personalizarlo.
- **Solución:** Cambia `"package": "com.tuusuario.sensoreshub"` en `app.json` antes de ejecutar el build.

### Error: "Missing permissions in Manifest"
- **Causa:** Faltan permisos de hardware en la compilación nativa.
- **Solución:** Ya se encuentran preconfigurados en `app.json` bajo `android.permissions` (`CAMERA`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `USE_BIOMETRIC`, `USE_FINGERPRINT`, `VIBRATE`).

### Error: "Execution failed for task ':app:processReleaseResources'"
- **Causa:** Versiones desalineadas del SDK o dependencias nativas incompatibles.
- **Solución:** Ejecuta `npx expo-doctor` para validar la alineación de todas las versiones con el SDK 52.
