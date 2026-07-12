# Observaciones raras — revisar al finalizar todos los planes

Registro de cosas raras, deuda leve, inconsistencias y promesas sin cumplir
encontradas durante el desarrollo. Cada entrada apunta **dónde** y **por qué es
rara**; se revisan al cerrar todos los planes para ver si se resolvieron solas o
necesitan ajuste. No es backlog de trabajo — es bitácora de cosas que no
cuajaron del todo y conviene tener a la vista.

---

## Check-in (plan 02)

### O-01 · Las 3 tarjetas de modo del intro son UI muerta

**Dónde:** `src/features/checkin/intro/CheckinIntroScreen.tsx`
**Qué pasa:** `mode` es un `useState` local (`"quick" | "complete" | "nothing" | null`).
Solo hace dos cosas: resaltar la `SelectableCard` elegida y mantener
`disabled={mode === null}` en "Empezar". No se persiste (sin columna DB, sin
campo en `CheckinDraft`, sin campo en `useCheckinStore`), no se propaga a la
navegación (`onStart` siempre empuja `/checkin/bleeding`), ninguna pantalla ni
servicio lo lee. Se descarta al navegar.
**Mentira en el código:** el comentario de `start()` dice "nada que reportar →
review directo" pero `start()` siempre llama `onStart()` → siempre va a bleeding.
**Triada sin respaldo:** el plan 02 NO define 3 modos de captura
(rápido/completo/nada). Su "modo" = modo reproductivo
(`tracking_only`/`avoid`/`ttc`/`pregnancy`), que SÍ funciona vía `useActiveIntent`.
**Decisión:** dejar así por ahora; la velocidad real llega en Fase 4 vía
quick-options del catálogo + prefill, no vía un toggle de modo declarado. Si al
cerrar Fase 4 las tarjetas siguen sin función, eliminarlas (intro = hero + lead
+ botón Empezar siempre activo).

### O-02 · "Guardar accesible desde cualquier paso" no implementado

**Dónde:** `src/features/checkin/shared/components/checkin-screen/CheckinScreen.tsx`
**Qué pasa:** `CheckinScreen` es un contenedor puro (`SafeAreaView` + `ScrollView`).
No pinta footer ni CTA de guardado. Cada paso renderiza su propio botón
"Continuar". Solo `ReviewScreen` tiene "Guardar".
**Promesa rota:** Fase 2 del plan 02 dice textualmente "«guardar» accesible desde
cualquier paso". Hoy no lo está.
**Decisión:** entra en Fase 4 (velocidad): un día vacío < 15 s requiere poder
guardar desde el primer paso sin recorrer todo el wizard.

### O-03 · Navegación condicional por `periodStatusSignal` no existe

**Dónde:** `src/app/checkin/_layout.tsx` (Stack estático de 9 rutas en orden fijo)
**Qué pasa:** si la usuaria marca "Terminó" (mi regla) en Bleeding, el wizard
igual le muestra intensidad de sangrado y coágulos en ese mismo paso, y luego
avanza por los 9 pasos sin saltar nada. Ninguna pantalla lee `periodStatusSignal`
para ocultar/mostrar controles.
**Insight válido del usuario:** "si marca ya terminó mi regla, no tiene sentido
pedir cuanto sangrado tiene o cuánto coágulo".
**Decisión:** navegación condicional por señal es territorio Fase 4. Hoy la
señal solo se persiste como auditoría (no abre/cierra rachas — eso vive en el
plan 03).

### O-04 · Columnas huérfanas en `checkins`

**Dónde:** `src/db/schema/checkin.ts` (`painIntensity`, `painInterference`,
`pmsIntensity`)
**Qué pasa:** las tres columnas tienen `CHECK` pero `createCheckin.ts` NUNCA las
escribe. No existen en `CheckinDraft`. Son schema muerto.
**Origen:** probablemente del diseño v2 que las anticipó y nunca se poblaron.
**Decisión:** revisar al cerrar plan 02. Si ninguna señal → valor las usa, sacar
las columnas (regeneración de schema, sin migración). `breastTenderness` tiene
i18n pero ni siquiera tiene columna — ver O-05.

### O-05 · Claves i18n huérfanas en `checkIn.json`

**Dónde:** `src/lang/{es,en}/checkIn.json`
**Qué pasa:** existen claves que ninguna pantalla consume:
- `feelings.sleep.*` — no hay columna `sleep` en `checkins` (auditoría 4.1 la
  propuso como `sleep_quality` pero no entró). `FeelingsScreen` solo renderiza
  ánimo/energía/estrés.
- `body.pain.*`, `body.interference.*`, `body.pms.*` — espejo de las columnas
  huérfanas O-04. Sin consumidor.
- `body.breastTenderness.*` — ni columna ni pantalla.
**Decisión:** limpiar junto con O-04 al cerrar el plan, o poblar si Fase 4/07
les da uso.

### O-06 · `medications.pregnancySafety.*` sin implementar

**Dónde:** `src/lang/{es,en}/checkIn.json` + `src/features/checkin/medications/MedicationsScreen.tsx`
**Qué pasa:** la promesa Fase 3 del plan 02 dice "medicamentos en embarazo
muestran su `pregnancy_safety` (aviso neutro si `caution`, nada si `unknown`)".
`MedicationsScreen` NO lee `pregnancy_safety` del catálogo ni muestra aviso. Las
claves i18n `medications.pregnancySafety.caution/unknown` existen sin consumidor.
**Decisión:** deuda de Fase 3. Implementar el aviso o bajar la promesa del plan.
Revisar al cerrar plan 02.

### O-07 · `review.empty` contradice el botón deshabilitado

**Dónde:** `src/features/checkin/review/ReviewScreen.tsx`
**Qué pasa:** cuando el draft está vacío, el texto dice "No anotaste nada.
Puedes guardar igual." pero el botón "Guardar" está `disabled={isSubmitting || isEmpty}`.
El copy miente: NO puede guardar vacío.
**Fondo:** `useCompleteCheckin.submit()` retorna `true` sin insertar nada si
`isEmpty` (día "nada que reportar" = no-op). El botón deshabilitado es UX
correcta (no hay nada que guardar), pero el texto debe decir otra cosa.
**Decisión:** o habilitar guardado vacío (no-op + dismiss) o corregir el copy.
Mínimo: alinear texto con comportamiento.

### O-08 · `ChoiceCard` y `SelectableCard` conviven

**Dónde:** `src/features/checkin/shared/components/choice-card/ChoiceCard.tsx`
(icono arriba, vertical) y `src/components/selectable-card/SelectableCard.tsx`
(icono izquierda, horizontal).
**Qué pasa:** dos componentes de selección con layout distinto.
`ChoiceCard` lo usan Bleeding/Feelings/Body/Medications; `SelectableCard` el
intro y el onboarding. No es bug, pero dos patrones para la misma idea
"tarjeta seleccionable" puede fragmentar el design-system.
**Decisión:** revisar al cerrar M2. Si la dirección visual las unifica, consolidar
en uno solo con variantes de layout.

---

## Esquema / dominio

### O-09 · `symptom_catalog.applicable_mode` es valor único, no CSV

**Dónde:** `src/db/schema/symptomCatalog.ts` (`applicableMode` enum single)
**Qué pasa:** auditoría M1 recomendó `applicable_modes` CSV para expresar
"TTC **y** embarazo" (ej. náuseas). Hoy es un solo valor. `SymptomsScreen` filtra
por un modo. No puede haber un síntoma válido para dos modos a la vez.
**Decisión:** deuda de modelado abierta (M1). Se decide al regenerar schema.
Revisar si Fase 4 o plan 08 la necesita.

### O-10 · Versión de DB sin documentar en este punto

**Dónde:** `src/db/` (configuración de `DATABASE_VERSION`)
**Qué pasa:** decisiones previas fijaron "migración completa, no se hacen
migraciones hasta que exista release, todo se reconstruye desde cero". Cada
cambio de schema bumpa `DATABASE_VERSION` y fuerza reset. Confirmar que el valor
actual refleja todos los cambios acumulados antes de cualquier release.
**Decisión:** verificar al cerrar M2 / antes de M3.

---

## Onboarding (plan 00)

### O-11 · README del feature onboarding desactualizado

**Dónde:** `src/features/onboarding/README.md`
**Qué pasa:** describe componentes y dirección visual que ya no existen (ver
auditoría D2). Decisión previa: congelar con cartel "desactualizado", no
perseguir.
**Decisión:** reescribir cuando se retoque el feature. Si no se toca, dejar
congelado.

---

## Cómo usar este archivo

- Al cerrar cada plan, revisar las entradas con su etiqueta de área.
- Marcar como **✅ resuelto** (con commit que lo cerró) o **klaravía rara**
  si persiste.
- No añadir tareas nuevas aquí — esto es bitácora, no backlog.
- Si una observación se convierte en trabajo real, crear entrada en el plan
  correspondiente y dejar aquí una referencia.
