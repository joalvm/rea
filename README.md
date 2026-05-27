# Mensu

App personal para seguimiento menstrual local. Sin login, sin backend, sin nube.

## Stack

- Expo SDK 56
- React Native 0.85
- TypeScript strict
- SQLite local con `expo-sqlite`
- Notificaciones locales con `expo-notifications`

Nota: la app usa solo notificaciones locales. En Android con Expo Go no se debe importar el índice raíz de
`expo-notifications`, porque SDK 53+ no soporta push remoto en Expo Go.

## Scripts

```bash
npm run start
npm run android
npm run ios
npm run typecheck
```

## Emulador Android Sin Android Studio

Este repo incluye un instalador local para Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\install-android-emulator.ps1
```

Instala JDK 17, Android SDK command-line tools, platform-tools, emulator, Android API 36 y el AVD
`Mensu_API_36` en el perfil del usuario.

Para abrir el emulador:

```powershell
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT=$env:ANDROID_HOME
$env:JAVA_HOME="$env:LOCALAPPDATA\Programs\Temurin17"
$env:Path="$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:Path"
emulator -avd Mensu_API_36
```

Luego, desde este repo:

```powershell
npm run android
```

## Estado actual

- Onboarding paso a paso.
- Pantallas: Hoy, Calendario, Diario, Patrones.
- Check-in completo y check-in corto.
- Horario semanal configurable para notificaciones locales.
- Persistencia local en SQLite.

## Seguridad y privacidad

Los datos viven en el dispositivo. Esta versión no implementa nube, cuenta, analytics, contenido editorial, IA ni backup cifrado todavía.
