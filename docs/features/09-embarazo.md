# 09 · Embarazo

> **Hito:** fase 1 en **M3**, completo en M6 · **Depende de:** 01 (proyección diaria),
> 10 (transiciones), 11 (contenido semanal) · **Estado:** 🚧 semana, progreso y
> desenlaces básicos vivos; falta el flujo completo posparto.

## Contexto

El seguimiento de embarazo es uno de los **dos pilares** — no un modo secundario. Una
usuaria puede entrar por onboarding directamente embarazada; no puede encontrarse una
app vacía hasta medio roadmap. Por eso la fase 1 (semana en Hoy + dominio de semanas)
llega en M3 junto con las demás superficies, y el corpus semanal mínimo del plan 11 la
acompaña.

El embarazo también es donde el producto debe su máxima delicadeza: no todos los
embarazos terminan en nacimiento, y una app que solo contempla el final feliz lastima a
quien más apoyo necesita.

## Decisiones base

- **Dominio de semanas en `src/domain/pregnancy/`:** semana y trimestre desde
  `lmp_date` (con `dating_basis` como procedencia mostrada); proyección a
  `daily_summary` (`pregnancy_week`, trimestre, fase). Semana 40+ sin alarmismo
  ("cada embarazo tiene su ritmo").
- **Hoy en modo embarazo:** hero de semana ("semana 22"), hito de tamaño/desarrollo
  (contenido con fuente, plan 11), próxima marca (fin de trimestre, FPP), acceso al
  check-in adaptado.
- **Check-in adaptado, no duplicado** (plan 02): náuseas, movimiento fetal, peso,
  síntomas de embarazo; movimiento reducido ≥28 semanas dispara contenido de alerta
  ("consulta hoy con tu profesional") — recomendación con fuente, jamás diagnóstico.
- **Tres cierres de episodio, los tres dignos:**
    - **Nacimiento:** felicitación serena → transición a posparto (plan 10): modo de
      ciclo con "esperando tu primera regla", sin predicciones inventadas, pregunta de
      lactancia (afecta al motor).
    - **Pérdida:** flujo silencioso y breve — sin preguntas innecesarias, elección
      explícita de conservar o borrar los datos del episodio, contenido de apoyo con
      fuente, y **ninguna transición forzada**: la app queda en un estado neutro hasta
      que ella decida. Ninguna notificación de embarazo vuelve a dispararse.
    - **Otro** (con nota libre): mismo cuidado que pérdida.
- **Editar el episodio** (Ajustes → Embarazo): corregir FPP/FUM tras ecografía
  (`dating_basis = 'ultrasound'`), recalculando semanas hacia atrás y hacia delante.

## Señal → valor

| Señal                    | Qué produce                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| FUM/FPP + `dating_basis` | Semana y trimestre con procedencia honesta                       |
| Náuseas / síntomas       | Evolución por semana (plan 07); contenido contextual             |
| Peso                     | Curva por semana, sin juicio ni objetivos                        |
| Movimiento fetal         | Registro tranquilizador; reducción ≥28 sem → contenido de alerta |
| Lactancia (al cierre)    | Motor de posparto honesto (plan 01)                              |

## Fases

### [ ] Fase 1 (M3): Semanas + hero

- **Objetivo:** la usuaria embarazada abre REA y ve su semana, no una pantalla vacía.
- **Cambios:** `src/domain/pregnancy/` (semana/trimestre/proyección + tests); hero de
  embarazo en Hoy (plan 04); banda de semanas en calendario (plan 05); corpus semanal
  mínimo conectado (plan 11 fase 1).
- **No hacer:** cierres de episodio (fase 3); check-in de embarazo completo (viene con
  plan 02).
- **Cierre:** fixtures — FPP dada produce semana correcta hoy (test); QA del hero con
  episodio real de onboarding.

### [ ] Fase 2 (M6): Semana a semana completo

- **Objetivo:** el acompañamiento entero del embarazo.
- **Cambios:** mockup (`docs/design-system/screens/embarazo.html`); pantalla/sección de
  embarazo (semana actual, desarrollo, lista de semanas); contenido semanal completo
  1–42 (plan 11 fase 2); peso por semana (plan 07); alerta de movimiento reducido.
- **No hacer:** contadores de patadas dedicados, listas de nombres, fotos de barriga
  (criterio de entrada: petición real).
- **Cierre:** QA de un embarazo seed recorriendo trimestres; copy es/en revisado.

### [ ] Fase 3 (M6): Cierres dignos

- **Objetivo:** los tres finales, con el cuidado que merecen.
- **Cambios:** flujos de cierre (nacimiento / pérdida / otro) con mockup propio revisado
  en frío; mutaciones transaccionales (cerrar episodio + transición del plan 10 +
  cancelar notificaciones de embarazo); elección conservar/borrar datos en pérdida;
  contenido de apoyo con fuente.
- **No hacer:** pedir detalles del desenlace más allá de lo voluntario
  (`outcome_details` es opcional); reactivar predicciones de ciclo automáticamente tras
  pérdida.
- **Cierre:** tests de integración de los tres cierres (datos, modo resultante,
  notificaciones canceladas); revisión de copy con lectura en frío es/en.

## Riesgos y preguntas abiertas

- **El flujo de pérdida es lo más delicado del producto entero:** se diseña primero, se
  revisa con personas reales si es posible, y ante la duda se quita texto en vez de
  añadirlo.
- **Embarazos que superan la semana 42:** la app no presiona; contenido de "habla con tu
  profesional" y ya.
- **Datación por ecografía** que contradice la FUM: gana la ecografía
  (`dating_basis='ultrasound'`); el historial de semanas se reproyecta y se dice
  ("tus semanas se ajustaron").
