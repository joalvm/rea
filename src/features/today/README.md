# Feature: Inicio (Home / Today)

Tab principal. Debe responder en <5s: **¿dónde estoy en mi ciclo? · ¿qué registro hoy? ·
¿hay algo importante?**

Ruta: `src/app/(tabs)/index.tsx` · Componente: `src/features/today/Today.tsx` ·
Fase: **MVP** (el diseño del Hero legacy es la única referencia visual reutilizable).

## Secciones

1. **Hero** — fase estimada + día de ciclo + **confianza** + próximo evento.
   Honestidad: usar `daily_summary.estimated_phase`, `phase_confidence`, `phase_source`;
   nunca presentar la estimación como certeza. Si está en periodo, mostrar "día N de sangrado".
2. **Card de predicción contextual** según intención:
   - Seguimiento: "tu próximo periodo podría llegar en N días".
   - TTC: "podrías estar cerca de tu ventana fértil".
   - Anticoncepción hormonal: "las fases pueden no representar ovulación natural".
   - Embarazo activo (`pregnancy_episodes`): "predicciones de ciclo pausadas".
3. **"¿Por qué Rea cree esto?"** — último periodo, ciclo declarado, regularidad, datos
   recientes, nivel de confianza, observado vs estimado.
4. **CTA de check-in** — emocional ("¿cómo te sientes ahora?", "menos de 1 minuto") →
   abre `/checkin`. Acciones rápidas: "mi periodo empezó/terminó".
5. **Resumen del día** — chips desde `daily_summary` (ánimo/energía/estrés/dolor/síntoma top,
   medicación, relación). No tabla.
6. **Consejo contextual** — contenido `surface='today'` (vía `content_rules`), con fuente y
   "no es diagnóstico"; registrar en `content_delivery_log`.
7. **Alertas suaves** — informativas, no alarmistas (p. ej. dolor alto varios días).

## Datos

Lee: `daily_summary`, `period_runs`, `reproductive_intent_history`, `content_items`+`content_rules`.
Escribe: solo log de entrega de contenido.

## Pendiente

Hero real, motor de predicción, matcher de contenido, variantes por contexto, alertas.
