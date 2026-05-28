# Rea

Rea es una app movil privada para registrar ciclo menstrual, sintomas y cambios cotidianos sin convertir esa informacion en una promesa de precision falsa. Su idea central es simple: ayudar a observar mejor lo que pasa en el cuerpo, con calma, sin cuenta, sin nube y sin volver la experiencia invasiva.

## Que hace hoy

Rea acompana un uso diario y sereno. Empieza con un onboarding corto para tomar un punto de partida y luego organiza la experiencia en cuatro espacios faciles de leer:

- Hoy: muestra una lectura clara del momento actual, con fase, dia del ciclo y referencias orientativas segun datos reales o estimados.
- Calendario: deja ver historia reciente, dias marcados y distribucion del ciclo de forma mas comprensible.
- Diario: permite registrar check-ins rapidos y cierres mas completos del dia.
- Patrones: resume tendencias que se repiten en tus propios datos sin venderlas como diagnostico.

## Que puedes registrar

La app permite guardar animo, energia, dolor, estres y notas breves. En registros mas completos tambien puedes anotar sangrado, sintomas frecuentes e impacto funcional para que luego esos datos sirvan en el calendario, la pantalla de hoy y la lectura de patrones.

Los recordatorios son opcionales. Si quieres usarlos, Rea puede preguntar de forma breve y discreta. Si no quieres activarlos, la app sigue siendo totalmente util.

## Privacidad

La privacidad es parte del producto. Los datos viven en el dispositivo. No hace falta iniciar sesion. No hay backend, no hay nube y no hay analitica en esta version del proyecto.

Si el telefono no concede permisos de notificacion, Rea sigue funcionando. Si borras los datos o desinstalas la app, los registros no se recuperan solos porque no existe sincronizacion remota.

## Lo que no promete

Rea no reemplaza atencion medica. No diagnostica, no promete precision fertil, no convierte sintomas en conclusiones clinicas y no sustituye seguimiento profesional. Cuando estima algo, debe sentirse como orientacion, no como certeza.

## Para aportar al proyecto

Si vas a colaborar en el desarrollo, este repo trabaja hoy con Expo, React Native y TypeScript, con almacenamiento local y recordatorios locales.

Comandos base:

```bash
npm install
npm run start
npm run android
npm run typecheck
npm run lint
```

Build Android local:

- `npm run build:android:apk`: genera APK con version actual.
- `npm run build:android:apk:build`: sube solo `android.versionCode` y `ios.buildNumber`.
- `npm run build:android:apk:patch`, `minor`, `major`: suben version semantica y tambien los contadores nativos.
- Cada build deja un archivo versionado en `dist/rea-vX.Y.Z-bN.apk` y actualiza alias `dist/rea-release.apk`.

Colaboracion y seguridad:

- asumir `master` como rama protegida para colaboraciones futuras
- preferir trabajo por ramas y pull requests
- mantener checks de validacion antes de fusionar cambios
- usar squash merge como camino normal de integracion
- tener en cuenta que los pushes directos a `master` deben llegar firmados

Criterios de aporte:

- mantener enfoque local-first y privado
- no tocar `colors.primary` en `src/theme.ts`
- diferenciar siempre entre dato observado, estimado y desconocido
- evitar copy o UI que sugiera precision clinica falsa
- no commitear `ROADMAP.md` ni archivos equivalentes de plan local
