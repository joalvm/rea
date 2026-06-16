# Feature: Configuración

Tab índice que abre subpantallas. Rutas: `src/app/(tabs)/settings.tsx` (índice) +
`src/app/settings/*` · Componentes: `src/features/settings/*`.

## Subpantallas

| Pantalla | Qué hace → esquema | Fase |
|---|---|---|
| cycle-profile ("Mi contexto") | Editar regularidad, longitudes, anticoncepción, TTC. **Crea NUEVA versión** en `reproductive_intent_history` (cierra la vigente con `effective_to`); no sobrescribe. | MVP |
| notifications | Activar/desactivar, ventana, intervalo, tipo → `user_profile.reminder_*`. | MVP |
| medications | CRUD del catálogo personal `medication_catalog` (`normalized_name` evita duplicados). | MVP |
| pregnancy ("Modo embarazo") | Inicio/fin de `pregnancy_episodes`. **Pausa predicciones**; el diario sigue. Sin seguimiento semana a semana. | MVP |
| privacy | Exportar / importar / borrar todos los datos + bloqueo PIN/biometría. Local-first como ventaja. | **P3** |
| sources | Fuentes revisadas del contenido (`content_sources`): tipo, referencia, fecha de revisión. | P2 |
| about | Disclaimer (no diagnostica, no anticonceptivo), versión, privacidad. | MVP |

## UX

- "Mi contexto" es **versionado**: cambiar de objetivo o de anticoncepción debe abrir un nuevo
  tramo temporal, conservando el historial (clave para estadísticas correctas en el tiempo).
- Privacidad debe ser visible y honesta: explicar que **nada sale del dispositivo**.

## Pendiente

Formularios reales, lógica de versionado de contexto, export/import, bloqueo con PIN/biometría.
