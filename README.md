# Rea

Rea es una app movil privada para registrar el ciclo menstrual y notar como cambia el cuerpo, el animo y la energia a lo largo del mes. La idea central es simple: ayudarte a observarte mejor sin cuenta, sin nube y sin convertir tus datos en un servicio externo.

Hoy Rea funciona como una app local-first. Todo se guarda en el dispositivo. Si no quieres recordatorios, puedes usarla igual. Si aceptas notificaciones, solo recibiras preguntas breves y discretas, sin mostrar informacion sensible en pantalla bloqueada.

## Que es hoy

Rea esta pensada para acompanar un uso cotidiano y tranquilo. Al abrirla por primera vez, la app hace un onboarding corto para entender desde donde empezar: fecha de ultima regla, duracion aproximada del ciclo, duracion del sangrado, regularidad, uso de anticonceptivos hormonales y prioridad personal. Con eso construye una primera estimacion. Esa estimacion no pretende adivinar con precision clinica; sirve como punto de partida y mejora en la medida en que hay mas registros.

Despues del inicio, la app se organiza en cuatro espacios faciles de entender:

- `Hoy`: muestra la fase estimada, el dia del ciclo, una referencia de cuando podria llegar la siguiente regla y una ventana fertil orientativa.
- `Calendario`: deja ver el mes completo, los dias con registro y la distribucion estimada de fases.
- `Diario`: guarda momentos rapidos y registros completos para que luego tengan contexto.
- `Patrones`: resume tendencias suaves a partir de tus propios datos, sin afirmar causas medicas.

## Que puedes registrar

Rea tiene dos formas de uso. La primera es un check-in rapido para registrar como te sientes en ese momento. La segunda es un registro mas completo para cerrar el dia. En ambos casos puedes guardar animo, energia, dolor, estres y una nota opcional. En el registro completo tambien puedes marcar nivel de sangrado y sintomas frecuentes como colicos, migrana, acne, hinchazon, sensibilidad, antojos, insomnio o nauseas.

La app tambien permite configurar recordatorios por la manana, por la noche y en horarios personalizados. Cada recordatorio puede activarse o apagarse, mover la hora y elegir dias de la semana.

## Que no hace

Rea no reemplaza atencion medica. No diagnostica, no promete precision fertil, no interpreta sintomas como evidencia clinica y no sustituye seguimiento profesional. Tampoco tiene funciones de cuenta, sincronizacion entre dispositivos, analitica, contenido editorial, inteligencia artificial ni backup automatico.

Esto tiene una consecuencia importante: si desinstalas la app, limpias sus datos o cambias de telefono, los registros no se moveran solos contigo.

## Privacidad

La privacidad es parte del producto, no un agregado. Los datos viven dentro del dispositivo en una base local. No hace falta iniciar sesion para usar la app. No hay backend, no hay nube y no hay envio de informacion personal a terceros dentro de esta version del proyecto.

Las notificaciones estan pensadas para ser discretas. Si el sistema operativo no concede permiso, Rea sigue funcionando, solo que sin recordatorios programados.

Desde Ajustes existe una opcion para borrar todo y volver al inicio. Esa accion elimina los registros guardados en ese dispositivo.

## Compatibilidad actual

Segun la configuracion actual del proyecto, Rea esta pensada primero para movil y en orientacion vertical.

- `Android`: es el camino mas directo para pruebas hoy. El proyecto ya incluye notificaciones locales, base de datos local y un script para levantar un emulador Android en Windows sin depender de Android Studio completo.
- `iPhone y iPad`: el proyecto esta configurado para iOS y declara soporte de tablet, pero eso no equivale a una publicacion ni a una validacion final de tienda.
- `Web`: existe script de arranque web, pero la experiencia fue disenada para movil. Conviene tratar web como vista de desarrollo o revision, no como soporte equivalente al telefono.
- `Sin internet`: el uso principal no depende de conexion. La app puede funcionar offline porque guarda la informacion de manera local.

## Estado real del proyecto

Rea esta en estado de desarrollo. Este repositorio contiene el codigo fuente, no una version distribuida en App Store o Play Store. El nombre publico ya es `Rea`, aunque en varios identificadores tecnicos todavia aparece `mensu` porque era el nombre anterior del proyecto. Eso incluye partes como el paquete interno, el `slug`, la base local y el nombre del emulador Android. No cambia la idea del producto, pero conviene saberlo si revisas el codigo o los logs.

## Si quieres usarla sin meterte al codigo

Lo importante es esto:

1. Abres la app.
2. Completar el onboarding toma pocos pasos.
3. Puedes registrar como te sientes una o varias veces al dia.
4. El calendario y la pantalla de patrones se vuelven mas utiles con el tiempo.
5. Si no quieres notificaciones, la app sigue siendo totalmente usable.

## Desarrollo

Si vas a desarrollar Rea, el stack actual es Expo + React Native + TypeScript, con almacenamiento local en `expo-sqlite` y recordatorios en `expo-notifications`.

Comandos principales:

```bash
npm run start
npm run android
npm run ios
npm run web
npm run typecheck
npm run lint
```

En Windows hay un instalador para preparar emulador Android sin Android Studio completo:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\install-android-emulator.ps1
```
