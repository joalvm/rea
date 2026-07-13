# 02 · Check-in (captura diaria)

> **Hito:** M2 · **Depende de:** 01 (motor), 03 (señal de periodo), esquema v3 ·
> **Estado:** 🚧 Fase 1 ✅ (mockup + catálogo + i18n). Fase 2 ✅ (wizard funcional). Fase 3 ✅ (cuerpo, fertilidad y puente de test). Fase 4 ✅ (velocidad: quick-options, prefill, guardar en cualquier paso).

## Contexto

El check-in es el corazón de captura: todo lo que REA sabe nace aquí. Si registrar es
lento o pide cosas irrelevantes, la usuaria deja de venir y el motor se queda ciego. El
wizard existe como rutas vacías: `index → bleeding → feelings → symptoms → body →
fertility → medications → note → review`.

Objetivo de producto: **registrar un día normal toma menos de 60 segundos**, y un día
"nada que reportar" menos de 15.

## Decisiones base

- **Los pasos se adaptan al modo** (tabla abajo). Lo que no aplica no aparece; nada de
  pantallas con la mitad de controles deshabilitados.
- **Todo es opcional.** "Guardar" está disponible desde cualquier paso; los pasos vacíos
  se saltan con un tap. El wizard nunca regaña por dejar campos vacíos.
- **Varios check-ins al día están permitidos** (mañana y noche son cuerpos distintos);
  el proyector promedia/agrega por día. Editar lo ya registrado es del diario (plan 06).
- **La señal de periodo delega en el plan 03:** "me bajó / sigue / terminó" solo crea o
  cierra rachas vía las mutaciones de gestión de periodo, nunca directamente.
- **El test de embarazo se captura en todos los modos de ciclo** (auditoría A6), no solo
  en TTC. Un positivo muestra una tarjeta **neutra y cuidadosa** — para quien evita
  puede no ser una buena noticia: sin celebración, sin drama; "puedes activar el modo
  embarazo cuando quieras, o seguir como estás" → puente del plan 10. En TTC el tono es
  cálido, nunca confeti (los falsos positivos y la ansiedad existen).
- **Señales con contexto honesto:** la BBT pide hora de toma (solo vale al despertar);
  el peso es opcional y sin juicio; medicamentos en embarazo muestran su
  `pregnancy_safety` (aviso neutro si `caution`, nada si `unknown`).

### Pasos por modo

| Paso               | tracking_only                             | avoid                       | ttc                              | pregnancy                         |
| ------------------ | ----------------------------------------- | --------------------------- | -------------------------------- | --------------------------------- |
| Sangrado           | ✓                                         | ✓                           | ✓                                | — (existe como síntoma de alerta) |
| Ánimo y cuerpo     | ✓ ánimo/energía/estrés/sueño              | ✓                           | ✓                                | ✓                                 |
| Síntomas           | ✓ (catálogo por modo)                     | ✓                           | ✓                                | ✓ (síntomas de embarazo)          |
| Cuerpo             | moco (opc), BBT (opc), libido, peso (opc) | + BBT destacada             | + posición cervical, BBT + hora  | náuseas, movimiento fetal, peso   |
| Fertilidad y tests | test de embarazo, relaciones              | + test embarazo, relaciones | + OPK, test embarazo, relaciones | relaciones (informativo)          |
| Medicamentos       | ✓                                         | ✓                           | ✓                                | ✓ (+ aviso `pregnancy_safety`)    |
| Nota               | ✓                                         | ✓                           | ✓                                | ✓                                 |
| Revisión           | ✓                                         | ✓                           | ✓                                | ✓                                 |

## Señal → valor

| Señal                            | Qué produce                                                    |
| -------------------------------- | -------------------------------------------------------------- |
| Sangrado (0-4) + señal periodo   | Rachas → ciclos → predicción (planes 03/01)                    |
| Ánimo/energía/estrés/sueño (1-5) | Curvas por día de ciclo; patrón premenstrual (plan 07)         |
| Síntomas + intensidad            | Frecuencia por fase; contenido contextual (planes 07/11)       |
| Moco / posición cervical         | Evidencia de ventana fértil observada (plan 01)                |
| BBT + hora                       | Confirmación de ovulación; descarte de tomas tardías (plan 01) |
| OPK / test de embarazo           | Ancla de ovulación; puente a modo embarazo (planes 01/10)      |
| Libido                           | Curva por fase (plan 07)                                       |
| Peso                             | Seguimiento suave (embarazo) y retención por fase (plan 07)    |
| Relaciones (+protección)         | Timing TTC; conciencia en evitar (plan 08)                     |
| Medicamentos + alivio            | "Qué te funciona" por síntoma (plan 07)                        |
| Nota                             | Contexto en diario; jamás se analiza automáticamente           |

## Fases

### [x] Fase 1: Diseño + cimientos de catálogo

- **Objetivo:** mockup aprobado y catálogo/i18n listos antes de una línea de RN.
- **Cambios:** `docs/design-system/screens/checkin.html` (todos los pasos, ambos temas,
  los 4 modos); `lang/{es,en}/check-in.json`; seeder de síntomas ampliado (~10 de
  embarazo: acidez, hinchazón de tobillos, Braxton Hicks, presión pélvica, ciática…) con
  `applicable_modes` poblado y `label_key` apuntando al namespace real (auditoría M9).
- **No hacer:** código de pantallas.
- **Cierre:** mockup aprobado visualmente; seeder testeado (cada síntoma tiene label
  es/en resoluble).

### [x] Fase 2: Wizard funcional

- **Objetivo:** registrar de verdad, con guardado atómico.
- **Cambios:** draft efímero en Zustand; navegación de pasos por modo; guardado
  transaccional (checkin + síntomas + medicamentos + relaciones + señal de periodo vía
  plan 03) → recálculo del motor; "guardar" accesible desde cualquier paso.
- **No hacer:** los pasos cuerpo/fertilidad avanzados (fase 3); edición de check-ins
  pasados (plan 06).
- **Cierre:** test de integración — guardar un check-in completo escribe todas las
  tablas y dispara reproyección del día; guardar vacío no crea basura.

### [x] Fase 3: Cuerpo, fertilidad y el puente de test

- **Objetivo:** las señales especializadas, por modo, con el puente cuidadoso.
- **Cambios:** pasos cuerpo/fertilidad completos según la tabla (BBT con hora, cervical
  solo TTC, OPK, libido, peso, náuseas/movimiento); test de embarazo en todos los modos
  de ciclo; tarjeta post-guardado de test positivo (copy neutro, dos salidas) que invoca
  el puente del plan 10.
- **No hacer:** interpretar el test (la tarjeta informa y ofrece, no concluye);
  gráficas (plan 08).
- **Cierre:** QA por modo — cada modo ve exactamente sus pasos; test positivo en modo
  evitar muestra la tarjeta neutra; copy es/en revisado.

### [x] Fase 4: Velocidad

- **Objetivo:** <60 s un día normal; <15 s un día vacío.
- **Cambios:** quick-options del catálogo (`is_quick_option`) arriba en el intro;
  valores del último check-in del día como punto de partida al reabrir (prefill del
  draft vía `getLastCheckinOfDay` + `hydrate` del store); "Guardar" accesible desde
  cualquier paso del wizard (`CheckinSaveButton` en cada pantalla); deep link
  `rea://checkin` (lo usará la notificación diaria del plan 12); métricas de pasos
  en dev (`checkinMetrics`) para medir los presupuestos de tiempo durante QA.
- **Deep link:** el scheme `rea` ya está en `app.json`; Expo Router enruta
  automáticamente `rea://checkin` → `/checkin`. No requiere código custom. La
  notificación del plan 12 lo abrirá con `Linking.openURL("rea://checkin")`.
- **No hacer:** gamificación, rachas de "días seguidos registrando" (presionan, no
  acompañan); navegación condicional por `periodStatusSignal` (O-03 — diferida a
  revisión final).
- **Cierre:** cronómetro real en dispositivo: los dos presupuestos de tiempo se cumplen.
  Tests de integración cubren `getLastCheckinOfDay` y `getQuickOptions`; test unitario
  cubre `hydrate`/`reset`/`toggleSymptom` del store.

## Riesgos y preguntas abiertas

- **Fatiga de registro:** la mejor defensa es que cada dato vuelva como aprendizaje
  visible (plan 07); si una señal no aparece en ninguna estadística, se quita del
  wizard.
- **Catálogo fijo:** sin síntomas personalizados en v1; criterio de entrada = usuarias
  reales lo piden.
- **Tarjeta de test positivo:** copy delicadísimo; revisar con lectura en frío en ambos
  idiomas antes de shipear.
