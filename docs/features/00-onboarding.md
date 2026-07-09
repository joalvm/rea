# 00 · Onboarding — ajustes

> **Hito:** M1 (fase 2 se ejecuta junto al plan 12 en M2) · **Depende de:** esquema v3 ·
> **Estado:** ✅ construido y funcional; estos son los únicos retoques. El flujo y su
> diseño visual no se rediseñan.

## Contexto

El onboarding existe: 10 pantallas bajo `src/app/(onboarding)/`, validación por paso,
cierre transaccional (`completeOnboarding`). Captura nombre, año de nacimiento, modo,
datos de ciclo (regularidad, longitudes, anticoncepción), datos de embarazo (FUM) y
preferencias de recordatorio.

Tres problemas reales, todos de lo que **escribe**, no de cómo se ve:

1. En modo embarazo inserta datos de ciclo inventados (`irregular/28/5`) porque el
   esquema los exigía NOT NULL (auditoría A2).
2. En modo evitar fuerza `anticoncepción = no`, borrando el caso común "píldora +
   seguimiento para evitar" (auditoría A2).
3. Promete recordatorios que nadie programa ni tiene permiso de mostrar (auditoría A1).

Y una mejora de anclaje: pide FUM en embarazo, pero la usuaria embarazada suele saber su
FPP (se la dio su médica), no su última regla.

## Decisiones base

- **Prohibido escribir lo que la usuaria no dijo.** Embarazo → campos de ciclo NULL.
  Evitar → pregunta real de anticoncepción.
- **Anticoncepción por método, no sí/no:** picker (ninguna, píldora, DIU hormonal, DIU
  de cobre, implante, inyección, anillo, parche, barrera, otro) + "prefiero no decirlo"
  (→ NULL) como opción de primera clase. "Hormonal" se deriva en dominio. La pregunta
  aparece en `tracking_only` y `tracking_avoid_pregnancy`; en TTC se guarda `none` sin
  preguntar; en embarazo no aplica (NULL).
- **Permiso de notificaciones just-in-time:** se pide al completar el onboarding y solo
  si la usuaria activó recordatorios. Denegado → se respeta sin insistir; el plan 12
  muestra un aviso suave en Hoy con re-intento manual.
- **Embarazo ancla por lo que la usuaria sabe:** selector "¿qué dato tienes?" — FUM o
  FPP. Con FPP: `lmp = fpp − 280` y `dating_basis = 'due_date'`. Con FUM:
  `dating_basis = 'lmp'`. La procedencia queda registrada.
- **Privacidad dicha en una línea verificable** en welcome: "Tus datos se quedan en tu
  teléfono, cifrados. Sin cuentas, sin anuncios." — coherente con el plan 15, sin
  marketing.

## Señal → valor

| Señal                        | Qué produce                                                                |
| ---------------------------- | -------------------------------------------------------------------------- |
| Método anticonceptivo        | Predicción por método: hormonal suprime ventana fértil; cobre/barrera no   |
| `dating_basis` + FUM/FPP     | Semana gestacional con procedencia honesta                                 |
| Campos de ciclo NULL         | Estadísticas de posparto sin "ciclo declarado" fantasma                    |
| Preferencias de recordatorio | Notificaciones reales (plan 12), con permiso pedido en el momento correcto |

## Fases

### [x] Fase 1: Verdad en los datos

- **Objetivo:** el onboarding nunca escribe lo que la usuaria no declaró.
- **Cambios:** sobre esquema v3 — `completeOnboarding` inserta NULL en campos de ciclo
  para embarazo; pantalla de anticoncepción pasa de toggle a picker de método (con
  "prefiero no decirlo"), visible también en modo evitar; TTC guarda `none`; draft y
  schemas zod actualizados; i18n es/en de las opciones.
- **No hacer:** tocar el orden de pasos ni el diseño visual aprobado; añadir preguntas
  nuevas más allá del método.
- **Cierre:** test de integración por modo — completar en embarazo deja campos de ciclo
  NULL; completar en evitar con "píldora" persiste `contraception_method = 'pill'`;
  typecheck/lint/tests verdes.

### [ ] Fase 2 (con plan 12, M2): Permiso just-in-time

- **Objetivo:** los recordatorios prometidos piden permiso en el momento honesto.
- **Cambios:** paso `complete` solicita permiso de notificaciones solo si
  `reminders_enabled`; resultado persistido; si se deniega, sin nag — el plan 12 ofrece
  re-intento desde Ajustes/Hoy; copy que explica para qué es el permiso antes del
  diálogo del sistema.
- **No hacer:** pedir el permiso al arrancar la app; programar notificaciones aquí (eso
  es del plan 12).
- **Cierre:** QA en dispositivo — conceder y denegar dejan estados coherentes; nunca se
  pide dos veces seguidas.

### [x] Fase 3: Anclaje de embarazo y copy de privacidad

- **Objetivo:** la semana gestacional nace de un dato que la usuaria realmente conoce.
- **Cambios:** `pregnancy-setup` con selector FUM/FPP (validación: FPP futura razonable,
  FUM ≤ hoy y ≥ hoy−300); persistir `dating_basis`; línea de privacidad en welcome;
  revisión de todo el copy es/en del flujo.
- **No hacer:** datación por ecografía (entra con el plan 09 cuando exista edición del
  episodio); preguntar ambas fechas.
- **Cierre:** completar con FPP produce `lmp` derivada y `dating_basis='due_date'`
  correctos (test); QA visual de los dos caminos.
- **Nota de implementación:** la línea de privacidad en welcome se dejó sin la palabra
  "cifrados" — el plan 15 (cifrado en reposo) todavía no está construido, y afirmarlo
  antes de tiempo repetiría exactamente el pecado de A2 (prometer algo que el build no
  cumple). Actualizar esa línea cuando el plan 15 cierre.

## Riesgos y preguntas abiertas

- La pregunta de método alarga el flujo → una sola pantalla, opciones grandes,
  "prefiero no decirlo" visible sin scroll.
- Usuaria que no recuerda FUM ni tiene FPP: permitir "no lo sé" → episodio sin ancla,
  semana desconocida hasta que edite (plan 09); nunca inventar una fecha.
- El botón "restaurar copia" del welcome llega con el plan 14 (hoy no hay nada que
  restaurar).
