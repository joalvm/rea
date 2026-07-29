# 14 · Backup y exportación

> **Hito:** M7 · **Depende de:** esquema v3 estable, 15 (cifrado: interacción con el
> archivo exportado) · **Estado:** 🚧 JSON versionado, CSV y restauración desde Ajustes
> vivos; falta la entrada desde welcome y el preview de reemplazo.

## Contexto

Local-first tiene un precio: si el teléfono muere, los datos mueren con él. Para que
"tus datos son tuyos" sea verdad completa, la usuaria necesita sacarlos (respaldo,
cambio de teléfono, llevárselos a su médica o a otra app) y volverlos a meter. Sin nube
de por medio: un archivo que ella guarda donde decida.

## Decisiones base

- **Dos formatos, dos propósitos:** - **Backup JSON** (completo, versionado): `{format: "rea-backup", schema_version,
app_version, exported_at, tables: {…todas…}}` — restaurable sin pérdida. - **CSV** (legible): check-ins aplanados + resumen de ciclos (`cycle_records`) — para
  hoja de cálculo o consulta médica. No restaurable, y lo dice.
- **Compartir vía hoja del sistema** (`expo-file-system` + `expo-sharing`): la usuaria
  decide destino. REA no sube nada a ningún sitio.
- **El archivo sale descifrado** — inevitable para que sea útil fuera — con aviso claro
  al exportar: "este archivo contiene tu información íntima sin cifrar; guárdalo en un
  lugar seguro". Cifrado con passphrase = v2 (criterio de entrada: petición real; no
  complicar el rescate de datos antes de tiempo).
- **Restaurar = reemplazar, con verdad por delante:** validar formato e integridad →
  `schema_version` debe ser **igual** a la actual (sin runner de migraciones no hay
  forward-migrate; cuando el runner exista — primer release — se aceptarán versiones
  anteriores) → preview ("contiene N ciclos, M check-ins, del año X al Y") → doble
  confirmación mostrando qué se reemplaza → import transaccional (todo o nada) →
  recálculo completo + reprogramación de notificaciones.
- **Restauración accesible desde welcome** ("Restaurar copia") y desde Ajustes.

## Señal → valor

Meta-valor: continuidad. El backup restaurado alimenta el motor exactamente igual; el
CSV le da a la usuaria la conversación con su médica que una app cerrada le negaría.

## Fases

### [ ] Fase 1: Exportación

- **Objetivo:** sacar todo, en ambos formatos.
- **Cambios:** `src/domain/backup/` — `serializeBackup(db)` (JSON íntegro, incl.
  soft-deleted) y `serializeCheckinsCsv(db)` (join legible, cabeceras localizadas);
  entrada en Ajustes → hoja de compartir; aviso de sensibilidad; deps
  `expo-file-system`/`expo-sharing` (criterio de entrada cumplido: imposible sin ellas);
  sellar `last_backup_at`.
- **No hacer:** subir a ningún servicio; cifrado del archivo.
- **Cierre:** round-trip test del JSON sobre un seed denso; el CSV abre bien en una hoja
  de cálculo real; QA de la hoja de compartir en iOS/Android.

### [ ] Fase 2: Restauración

- **Objetivo:** volver a casa en un teléfono nuevo.
- **Cambios:** `restoreBackup(db, file)` — validación (formato, versión igual,
  integridad referencial básica) → preview → wipe+import transaccional → recálculo del
  motor + notificaciones; UI en welcome y Ajustes; mockup de ambos flujos.
- **No hacer:** merge de backups (reemplazo total solamente); importar CSV; aceptar
  versiones de esquema distintas (hasta que exista el runner).
- **Cierre:** test de integración — export → restore en DB vacía = datos idénticos +
  proyecciones regeneradas; backup corrupto o de versión distinta → error claro sin
  tocar datos existentes; QA entre dos instalaciones.

### [ ] Fase 3: Recordatorio de respaldo (pequeño)

- **Objetivo:** que el backup exista antes del desastre.
- **Cambios:** nudge suave en Ajustes si nunca exportó o hace >60 días
  (`last_backup_at`); jamás notificación push por esto.
- **No hacer:** auto-backup a carpeta (v2, si lo piden).
- **Cierre:** nudge aparece/desaparece según `last_backup_at`; copy no culpabiliza.

## Riesgos y preguntas abiertas

- **Restaurar sobre datos existentes** es destructivo por diseño: la doble confirmación
  muestra ambos lados ("reemplazará tus 3 ciclos actuales por los 14 del archivo").
- **Backups de apps futuras** (downgrade): rechazo claro, nunca intento parcial.
- **Archivos enormes** (años de datos): medir con seed de 3 años antes de complicar con
  streaming.
