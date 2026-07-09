# 12 · Notificaciones locales

> **Hito:** fase 1 en M2 (recordatorio diario); fase 2 en M4 (predictivas) · **Depende
> de:** 00 fase 2 (permiso JIT), 01 (predicciones) · **Estado:** ❌ ausentes —
> `expo-notifications` es dependencia sin un solo import y el onboarding ya captura
> preferencias que nadie cumple (auditoría A1). Deuda de promesa, prioridad de honra.

## Contexto

Todo es **local**: programación en el dispositivo, cero push, cero servidores. El
sistema completo se reduce a: calcular qué recordar → programar con idempotencia →
respetar la discreción y los toggles.

## Decisiones base

- **Un único dueño:** `src/modules/notifications/` (programación es infraestructura,
  no feature). Nadie más importa `expo-notifications`.
- **Discretas por defecto** (`discreet_notifications = 1`): el lockscreen dice "Rea ·
  tienes un recordatorio", jamás "tu ventana fértil empieza hoy". El contenido explícito
  es opt-in consciente en Ajustes.
- **Reprogramación idempotente con horizonte rodante:** cada recálculo del motor,
  transición o cambio de ajustes ejecuta `reprogramAll()`: cancelar todo lo propio →
  programar los próximos **14 días**. Sin background tasks: cada apertura de app
  re-extiende el horizonte (límite iOS de 64 pendientes queda lejos).
- **Cada tipo tiene toggle propio** (columnas `notify_*` de v3) bajo el master
  `reminders_enabled`; las predictivas exigen confianza ≥ `medium` (plan 01) — REA no
  interrumpe con datos flojos.
- **Deep links:** cada notificación abre su destino (`rea://checkin`, `rea://today`).

### Tipos

| Tipo              | Cuándo                                                   | Hito | Default |
| ----------------- | -------------------------------------------------------- | ---- | ------- |
| `daily_checkin`   | Ventana/intervalo elegidos en onboarding                 | M2   | on      |
| `period_upcoming` | 2 días antes de la regla predicha (conf. ≥ medium)       | M4   | on      |
| `period_late`     | Predicha + 2 días sin regla registrada (conf. ≥ medium)  | M4   | on      |
| `fertile_window`  | Inicio de ventana (TTC: oportunidad; evitar: precaución) | M4   | on      |
| `bbt_morning`     | Recordatorio de toma al despertar (solo TTC, opt-in)     | M5   | off     |
| `pregnancy_week`  | Nueva semana gestacional                                 | M3\* | on      |

\* `pregnancy_week` puede adelantarse con la fase 1 del plan 09 si el módulo base (fase
1 de este plan) ya existe; si no, entra en M4.

## Señal → valor

Inverso al resto: las notificaciones **devuelven** el valor de las señales en el momento
útil (constancia de registro → mejor motor; predicción → anticiparse a la regla). Una
notificación que no ahorra una sorpresa o un olvido, sobra.

## Fases

### [ ] Fase 1 (M2): Módulo + recordatorio diario

- **Objetivo:** la promesa del onboarding se cumple.
- **Cambios:** `src/modules/notifications/` — permisos (con el flujo JIT del plan 00
  fase 2), catálogo de tipos, `reprogramAll()` idempotente, contenido discreto/explícito;
  programación del `daily_checkin` según `app_settings`; sección en Ajustes (master +
  toggle + ventana/intervalo); deep link al check-in.
- **No hacer:** tipos predictivos; background fetch.
- **Cierre:** test unit del cálculo de instancias (ventana/intervalo/14 días);
  `reprogramAll()` dos veces = mismas pendientes (test con mock); QA en dispositivo —
  llega, discreta, abre el check-in; denegar permiso deja la app sana con aviso en
  Ajustes.

### [ ] Fase 2 (M4): Predictivas

- **Objetivo:** el motor habla en el momento justo, con confianza suficiente.
- **Cambios:** tipos `period_upcoming`/`period_late`/`fertile_window`/`pregnancy_week`
  leyendo `cycle_predictions`/episodio; gate de confianza; variantes de copy por modo
  (fértil en evitar = precaución); toggles granulares en Ajustes; reprogramación
  enganchada a los disparadores del motor y transiciones.
- **No hacer:** notificación de "llevas N días sin registrar" en tono de culpa; resúmenes
  semanales (criterio de entrada: petición real).
- **Cierre:** tests de escenarios (predicción cambia → pendientes cambian; transición a
  embarazo cancela las de ciclo; confianza `low` = cero predictivas); QA es/en de todos
  los copys, discretos y explícitos.

## Riesgos y preguntas abiertas

- **Usuaria que no abre la app días:** el horizonte de 14 días cubre el hueco; si al
  volver el motor cambió, la reprogramación corrige.
- **Doze/optimización de batería en Android:** notificaciones programadas exactas pueden
  retrasarse; usar el modo inexacto por defecto (basta para estos tipos) y documentarlo.
- **Silencio elegido:** todo apagado es un estado válido y respetado — cero nags de
  "actívalas".
