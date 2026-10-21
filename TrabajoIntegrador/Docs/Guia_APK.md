# Guía para generar el APK — Retenes EMIC Stock

Esta guía explica cómo compilar el **APK de Android** del frontend (carpeta `client/`) usando
**EAS Build** (recomendado, en la nube) y, como alternativa, un **build local**.

- **Perfil `preview`** → genera un **APK** instalable directamente.
- **Perfil `production`** → genera un **AAB** (para Google Play).

> Antes de compilar, verificá que la **API sea accesible desde el teléfono**: el APK no usa
> `localhost`. Definí `EXPO_PUBLIC_API_URL` con la **IP pública/LAN del servidor** donde corre el
> backend.

---

## Índice

1. [Requisitos](#1-requisitos)
2. [Preparar la configuración](#2-preparar-la-configuración)
3. [Opción A: EAS Build (nube) — recomendada](#3-opción-a-eas-build-nube--recomendada)
4. [Opción B: build local](#4-opción-b-build-local)
5. [Puntos críticos antes de compilar](#5-puntos-críticos-antes-de-compilar)
6. [Instalar el APK](#6-instalar-el-apk)
7. [Actualizar la app (OTA)](#7-actualizar-la-app-ota)

---

## 1. Requisitos

- **Node.js** ≥ 18 y npm.
- Cuenta gratuita en [expo.dev](https://expo.dev).
- **EAS CLI** instalado globalmente:

  ```bash
  npm install -g eas-cli
  eas --version
  ```

- (Opcional, build local) **Android Studio** con el **Android SDK** y `JAVA_HOME` configurado,
  además de **JDK 17**.

---

## 2. Preparar la configuración

### 2.1 Variables del frontend

En `client/.env`, apuntar la API a la dirección del servidor (no `localhost`):

```ini
EXPO_PUBLIC_API_URL=http://192.168.0.10:4000/api/v1
```

> Esta URL **queda embebida** en el APK. Si cambia el servidor, hay que recompilar (o usar EAS
> Update, ver sección 7).

### 2.2 Datos de la app

Revisar en `client/app.json`:

- `expo.name` → nombre mostrado (por defecto `Retenes EMIC - Stock`).
- `expo.slug` → `retenes-stock`.
- `expo.android.package` → identificador único en Play (`com.retenesemic.stock`).
- `expo.version` → versión visible de la app.

### 2.3 Vincular el proyecto con EAS

Desde `client/`, ejecutar e iniciar sesión:

```bash
cd client
eas login
eas init          # vincula el repo con tu cuenta Expo y genera el projectId
```

`eas init` completa `expo.extra.eas.projectId` en `app.json` (viene como placeholder).

El archivo **`eas.json`** ya está incluido con los perfiles `development`, `preview` y
`production`.

---

## 3. Opción A: EAS Build (nube) — recomendada

### 3.1 Generar el APK

```bash
cd client
eas build -p android --profile preview
```

- EAS sube el proyecto, compila en la nube y devuelve un **enlace de descarga del APK**.
- También puede ejecutarse con el atajo ya definido en `package.json`:

  ```bash
  npm run build:apk
  ```

### 3.2 Seguir el estado

```bash
eas build:list          # historial de builds
```

Al finalizar, en la consola se muestra una **URL** y un **código QR** para descargar e instalar
el APK en el teléfono.

### 3.3 Generar el AAB para Google Play (opcional)

```bash
eas build -p android --profile production
eas submit -p android   # opcional: subir a Play Console
```

---

## 4. Opción B: build local

Requiere Android SDK + JDK 17 instalados.

```bash
cd client

# 1) Generar los proyectos nativos (crea client/android/)
npx expo prebuild --platform android

# 2) Compilar el APK de release
cd android
./gradlew assembleRelease        # Linux/macOS
gradlew.bat assembleRelease      # Windows

# 3) El APK queda en:
#    android/app/build/outputs/apk/release/app-release.apk
```

Para depurar en un dispositivo conectado por USB:

```bash
npx expo run:android
```

> El build local es sensible a la versión de JDK (usar **JDK 17**) y a la configuración del SDK.
> Si aparece cualquier problema de entorno, preferir EAS Build (Opción A).

---

## 5. Puntos críticos antes de compilar

| Punto | Detalle |
|-------|---------|
| **URL de la API** | `EXPO_PUBLIC_API_URL` debe ser accesible desde el teléfono (IP/LAN o dominio público), no `localhost`. |
| **Backend accesible** | El servidor debe escuchar en `0.0.0.0` y el **puerto 4000** estar abierto en el firewall. |
| **CORS** | Ajustar `CORS_ORIGIN` en el backend si se restringe el origen (en desarrollo `*` refleja el origen). |
| **package Android** | `expo.android.package` debe ser único y estable (no cambiarlo tras publicar). |
| **Íconos/Splash** | Reemplazar los íconos en `client/assets/` si se desea una marca propia. |
| **Seguridad** | Cambiar los secretos JWT y las credenciales de la BD antes de pasar a producción. |

---

## 6. Instalar el APK

1. Descargar el `.apk` (desde el enlace de EAS o copiarlo al teléfono).
2. En Android, permitir **“Instalar apps de origen desconocido”** para el navegador o el
   explorador de archivos.
3. Abrir el APK e instalar.
4. Iniciar la app y loguearse con un usuario de prueba
   (`admin@retenes.com` / `Admin123!`).

---

## 7. Actualizar la app (OTA)

Con **EAS Update** se pueden publicar cambios de JavaScript sin recompilar el APK:

```bash
cd client
eas update --branch preview --message "Ajustes de UI"
```

> Requiere que el APK se haya compilado con la configuración de `updates` habilitada. Para
> cambios nativos (nuevas librerías nativas) siempre hay que **recompilar** el APK.

---

## Resumen de comandos

```bash
npm install -g eas-cli      # instalar EAS CLI
eas login                   # iniciar sesión
cd client
eas init                    # vincular proyecto (una vez)
eas build -p android --profile preview    # APK instalable
eas build -p android --profile production # AAB para Play
eas build:list              # ver builds
```
