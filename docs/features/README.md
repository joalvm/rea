# Planes de features — índice

Un plan por feature, en formato uniforme: contexto → decisiones base → señal → valor →
fases con cierre verificable → riesgos. Los planes son **el diseño del producto**, no
solo del código: REA se está consolidando y aquí es donde se decide qué será. Nada de lo
que describen está cerrado salvo los principios del [README](../README.md) raíz.

## Índice

| #   | Plan                                                   | Hito principal | Qué resuelve                                                             |
| --- | ------------------------------------------------------ | -------------- | ------------------------------------------------------------------------ |
| 00  | [Onboarding — ajustes](00-onboarding.md)               | M1             | Deja de escribir datos falsos; permiso JIT; anticoncepción por método    |
| 01  | [Motor de ciclo](01-motor-de-ciclo.md)                 | M1             | Predicción honesta, proyección diaria, historial de ciclos y precisión   |
| 02  | [Check-in](02-check-in.md)                             | M2             | Captura diaria <60 s, adaptada al modo, con test de embarazo en todos    |
| 03  | [Gestión de periodo](03-gestion-de-periodo.md)         | M1             | Ciclo de vida de la regla: abrir, cerrar, corregir, sin autocierres      |
| 04  | [Hoy](04-hoy.md)                                       | M3             | La pantalla que responde "¿dónde estoy y qué viene?"                     |
| 05  | [Calendario](05-calendario.md)                         | M3             | Vista de mes con observado ≠ estimado y detalle de día                   |
| 06  | [Diario](06-diario.md)                                 | M2             | Editar, borrar y excluir registros; higiene estadística                  |
| 07  | [Estadísticas](07-estadisticas.md)                     | M4             | Cada dato capturado devuelto como aprendizaje, con gates de datos        |
| 08  | [Fertilidad y TTC](08-fertilidad-ttc.md)               | M5             | BBT, OPK, timing; modo evitar con marco conservador                      |
| 09  | [Embarazo](09-embarazo.md)                             | M3 + M6        | Semana a semana; desenlaces dignos; posparto sin predicciones falsas     |
| 10  | [Transiciones de modo](10-transiciones-de-modo.md)     | M3 + M5        | Cambiar de intención sin perder datos; puente test+ desde cualquier modo |
| 11  | [Contenido](11-contenido.md)                           | M3 + M6-M7     | Tips con fuente, reglas contextuales, corpus editorial                   |
| 12  | [Notificaciones](12-notificaciones.md)                 | M2 + M4        | Recordatorios locales, discretos, idempotentes                           |
| 13  | [Ajustes](13-ajustes.md)                               | transversal    | Configuración; re-anclaje de perfil; borrar todo                         |
| 14  | [Backup y exportación](14-backup-y-exportacion.md)     | M7             | Sacar y restaurar los datos sin nube                                     |
| 15  | [Privacidad verificable](15-privacidad-verificable.md) | **M1**         | Cifrado en reposo + cero-red impuesto por build, no por costumbre        |

## Arquitectura de información (propuesta abierta)

Las rutas actuales se crearon como andamiaje y **no son un compromiso**. Esta es la
propuesta, a validar con un mockup de navegación
(`docs/design-system/screens/navigation.html`) antes de M3.

**Hoy existe:** tabs `Hoy · Calendario · Diario · Estadísticas · Ajustes` + stacks
`checkin/*`, `content/[id]`, `diary/[date]`, `period/*`, `settings/*`.

**Propuesta:**

| Tab                                     | Contenido                                                                                                  |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Hoy**                                 | Hero de fase/semana, próximo evento, resumen del día, tarjeta de contenido. Ajustes vía icono en el header |
| **Calendario**                          | Mes + **detalle de día como sheet** (absorbe la vista diaria del diario) + segmento "Lista" cronológico    |
| **Registrar** (botón central destacado) | Abre el wizard de check-in. La acción nº 1 diaria merece el lugar más accesible                            |
| **Estadísticas**                        | Widgets con gates de datos + insights personalizados                                                       |
| **Aprender**                            | Biblioteca de contenido: por fase, por tema, guardados. El pilar de contenido gana superficie propia       |

Razones: registrar es la acción diaria número uno y hoy no tiene entrada directa;
ajustes es de baja frecuencia y no justifica un tab; diario y calendario responden la
misma pregunta ("¿qué pasó tal día?") con dos vistas — se funden; el contenido es pilar
declarado y necesita una superficie propia. `diary/[date]` sobrevive como ruta del
detalle de día (deep-linkable desde notificaciones).

## Grafo de dependencias

```
15 privacidad ──┐
                ├─→ esquema v3 ─→ 01 motor ─→ 03 periodo ─→ 02 check-in ─→ 06 diario
00 onboarding ──┘                    │
                                     ├─→ 04 hoy ─→ 05 calendario
                                     ├─→ 07 estadísticas ←─ cycle_records
                                     ├─→ 08 fertilidad (TTC)
                                     ├─→ 09 embarazo ←─ 11 contenido (corpus semanal)
                                     ├─→ 10 transiciones
                                     └─→ 12 notificaciones (fase 2 predictiva)
13 ajustes y 14 backup cuelgan de todos (secciones por dueño)
```

## Roadmap por hitos

| Hito      | Contenido                                                                                                                    | Planes                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **M0 ✅** | Fundaciones: DB v2, i18n/l10n, theme, onboarding                                                                             | —                                                 |
| **M1**    | **Confianza**: esquema v3 + cifrado en reposo + cero-red en CI + motor de ciclo + gestión de periodo + ajustes de onboarding | 15 · 01 · 03 · 00                                 |
| **M2**    | **Captura**: check-in por modos + diario + recordatorio diario                                                               | 02 · 06 · 12 (fase 1)                             |
| **M3**    | **Superficies**: Hoy + calendario + semana de embarazo + corpus mínimo de embarazo + puente test+ → embarazo                 | 04 · 05 · 09 (fase 1) · 11 (fase 1) · 10 (fase 1) |
| **M4**    | **Comprensión**: estadísticas con gates + notificaciones predictivas                                                         | 07 · 12 (fase 2)                                  |
| **M5**    | **Fertilidad**: TTC completo (BBT, OPK, timing) + transiciones completas                                                     | 08 · 10                                           |
| **M6**    | **Embarazo completo**: contenido semanal íntegro, desenlaces, posparto                                                       | 09 · 11 (fase 2)                                  |
| **M7**    | **Redondeo**: corpus completo de contenido + ajustes consolidados + backup/export + bloqueo de app                           | 11 · 13 · 14                                      |

Notas de corte: los **dos** pilares están presentes desde M3 — la usuaria que entra por
onboarding en modo embarazo tiene hero de semana y contenido semanal mínimo, no una
pantalla vacía. El puente test positivo → modo embarazo (fase 1 del plan 10) también
llega en M3 para que el pilar evitar tenga salida digna. El recordatorio diario llega en
M2 porque no depende de predicciones.

## Reglas transversales

1. **Mockup antes que código**: cada pantalla se diseña en
   `docs/design-system/screens/<feature>.html` y se aprueba visualmente antes del port a
   RN (regla del proyecto; dirección visual en `DESIGN.md`).
2. **Señal → valor**: ningún dato se captura sin fila en la tabla señal → valor de su
   plan. Si no alimenta estadística, predicción o contenido, no se pide.
3. **Lecturas por read hooks (`useLiveQuery`), escrituras por mutaciones en
   transacción**; el store nunca cachea la DB; features no se importan entre sí; el
   dominio compartido vive en `src/domain/`.
4. **Toda estimación muestra su base y confianza.** Las superficies distinguen observado
   de estimado, siempre.
5. **i18n desde el primer commit** de cada pantalla (es base, en par); nada hardcodeado.
6. **Estados vacíos que enseñan**: cuando faltan datos para una estadística o
   predicción, la pantalla dice qué falta y cuánto ("2 de 3 ciclos para tu curva"),
   nunca un espacio en blanco.

## Fuera de alcance (v1)

Sin sync ni cuentas ni nube (nunca), sin wearables ni HealthKit/Google Fit, sin
monetización de ningún tipo, sin comunidad/social, sin IA generativa sobre datos de la
usuaria, sin web. Cada "no" de un plan lleva su criterio de entrada si algún día deja de
ser no.
