# Feature: Onboarding

Wizard inicial que captura la información mínima para sembrar el motor de estimación
y comunica la **promesa de privacidad** antes de pedir datos íntimos.

Rutas: `src/app/(onboarding)/*` · Componentes: `src/features/onboarding/<paso>/` ·
Fase: **MVP**.

## Flujo

Lineal: `welcome → birth-year → last-period → cycle → regularity → contraception →
goal → notifications → complete`. `import` es un ramal desde `welcome` (restaurar copia).

| Paso | Pantalla      | Qué captura → esquema                                                           |
| ---- | ------------- | ------------------------------------------------------------------------------- |
| 1    | welcome       | Bienvenida + promesa de privacidad (local-first, no diagnostica). Sin datos.    |
| 1b   | import        | Restaurar copia de seguridad y validar hasta qué fecha hay datos.               |
| 2    | birth-year    | **Solo el año** → `user_profile.birth_year` (no fecha completa).                |
| 3    | last-period   | Inicio (+ fin opcional) → crea el primer `period_runs` (abierto si no terminó). |
| 4    | cycle         | `declared_period_length` / `declared_cycle_length` (def. 5 / 28).               |
| 5    | regularity    | `regular` / `variable` / `irregular` (copy humano).                             |
| 6    | contraception | `hormonal_contraception`. Si es true, condiciona fertilidad/TTC.                |
| 7    | goal          | `trying_to_conceive`. **Se omite** si usa anticoncepción hormonal.              |
| 8    | notifications | `reminder_*` (ventana 09:00–22:00, cada 6h por defecto).                        |
| 9    | complete      | Disclaimer + arranque.                                                          |

## Comportamiento esperado (al completar)

`complete` debe, en una transacción:

1. Crear/actualizar `user_profile` (nombre, `birth_year`, recordatorios).
2. Abrir la fila vigente de `reproductive_intent_history` (`effective_to = NULL`) con
   regularidad, longitudes, `trying_to_conceive`, `hormonal_contraception`.
3. Crear el primer `period_runs` con la fecha de "último periodo".
4. Sellar `user_profile.onboarding_completed_at`.

El gate `src/app/index.tsx` lee ese sello para decidir onboarding vs `(tabs)`.

## UX

- No mostrar "28 días" como verdad absoluta: "punto de partida, se ajusta con tus registros".
- Anticoncepción hormonal: avisar que las fases pueden no representar ovulación natural.
- Recordatorios: "puedes ignorarlos; Rea aprende con constancia, no con perfección".

## Pendiente

Formularios reales por paso (hoy `Placeholder`), validación, persistencia
transaccional, lógica condicional de `goal`, e import/restore.
