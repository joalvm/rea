# 15 · Privacidad verificable

> **Hito:** **M1** — antes que cualquier feature visible · **Depende de:** nada (es
> fundacional; el esquema v3 se regenera junto con esto) · **Estado:** 🚧 SQLCipher,
> SecureStore y verificación estática de red conectados; falta evidencia de build y
> dispositivo.

## Contexto

El diferencial de REA es que los datos íntimos no salen del teléfono ni se trafican.
Eso obliga a más que intención: el threat model real de una app de ciclo incluye pareja
con acceso al teléfono, padres, teléfono robado y backups del sistema operativo. Una
SQLite sin cifrar es legible para cualquiera con acceso al dispositivo o a su copia.

Este plan convierte las tres promesas de privacidad en mecanismos verificables:

1. **Datos cifrados en disco** (no solo una UI con candado).
2. **Cero red demostrable por build** (no "nadie ha añadido red todavía").
3. **Honestidad por capas:** la documentación y la pantalla de privacidad dicen
   exactamente qué protege cada cosa — cifrado = disco; bloqueo de app = pantalla;
   cero red = salida; discreción = lockscreen/calendario.

## Decisiones base

- **SQLCipher vía `expo-sqlite`:** el config plugin trae la opción `useSQLCipher`; la
  base se abre con `PRAGMA key`. Sin dependencia nueva de base de datos.
- **Clave aleatoria por dispositivo, en el almacén seguro del sistema:** generada con
  `expo-crypto` en el primer arranque y guardada con `expo-secure-store`
  (Keychain/Keystore). Sin passphrase de usuaria en v1: no hay contraseña que olvidar y
  el candado real ya es el del dispositivo. "Borrar todo" (plan 13) rota la clave.
- **Cero red impuesto por build:** release de Android **sin**
  `android.permission.INTERNET` (dev lo necesita para Metro; el mecanismo exacto —
  `blockedPermissions` o config plugin por variante — se decide al implementar);
  `NSAppTransportSecurity` sin excepciones en iOS.
- **Verificación en CI, no en memoria:** un check que ejecuta `expo prebuild` y falla
  si el manifest de release contiene INTERNET; más una lista blanca de dependencias
  (toda dependencia nueva se compara contra ella).
- **El backup exportado sale descifrado a propósito** (plan 14) — con aviso; cifrar el
  archivo lo volvería irrescatable sin más infraestructura.

## Señal → valor

Meta-valor: confianza. Ninguna señal nueva se captura; todas las ya capturadas pasan a
estar protegidas en reposo. Es la condición para que pedir datos íntimos sea ético.

## Fases

### [ ] Fase 1: Cifrado en reposo

- **Objetivo:** la base en disco es ilegible sin la clave del dispositivo.
- **Cambios:** `useSQLCipher: true` en `app.json`; módulo de clave
  (generar/leer/rotar) sobre `expo-secure-store`; apertura de DB con `PRAGMA key` en el
  provider; integración con "borrar todo" (rotación); tests de integración adaptados;
  medición de arranque antes/después.
- **No hacer:** passphrase de usuaria; cifrado de campos individuales; migrar bases
  existentes (no hay — el reset de dev basta).
- **Cierre:** prueba directa — extraer el archivo `.db` del dispositivo/emulador y
  verificar que no se abre sin clave (cabecera no-SQLite); la app arranca y opera
  normal; overhead de arranque medido y aceptable (<100 ms).

### [ ] Fase 2: Cero red demostrable

- **Objetivo:** el compromiso de red deja de depender de la costumbre.
- **Cambios:** configuración de permisos de release (Android sin INTERNET, ATS estricto
  en iOS); script de CI (`expo prebuild` + grep del manifest + lista blanca de
  dependencias en un JSON versionado); documentación del mecanismo en el README.
- **No hacer:** bloquear red en dev (Metro la necesita); proxies o firewalls locales.
- **Cierre:** el check de CI falla si se añade INTERNET al release o una dependencia
  fuera de la lista (probado introduciendo la violación); build de release instalada no
  puede hacer una petición HTTP (QA manual).

## Riesgos y preguntas abiertas

- **SQLCipher + Expo Go:** el plugin exige development build (Expo Go no lo soporta);
  el flujo de desarrollo pasa a dev-client — coordinarlo con el equipo (es el único
  cambio de flujo).
- **Pérdida del Keychain/Keystore** (restauración de sistema en otro dispositivo): la
  clave no viaja → la base no se abre → la app detecta el caso y ofrece empezar de cero
  o restaurar backup (plan 14). Es el comportamiento correcto para datos íntimos, y otra
  razón para el nudge de respaldo.
- **Rendimiento:** SQLCipher añade un coste pequeño por página; el criterio de cierre lo
  mide antes de aceptar.
