# 13 · Ajustes

> **Hito:** transversal (cada sección llega con su feature; consolidación en M7) ·
> **Depende de:** 10 (modo), 12 (notificaciones), 14 (backup), 15 (cifrado/lock) ·
> **Estado:** 🔲 stubs (8 rutas). Plan deliberadamente ligero: configuración, no
> producto — el detalle vive en los planes dueños.

## Contexto

Las rutas existen (`settings/*`): índice, perfil de ciclo, medicamentos,
notificaciones, embarazo, privacidad, fuentes, acerca de. En la arquitectura de
información propuesta, Ajustes se alcanza desde el header de Hoy (no como tab). Este
plan define el índice, lo transversal (tema, unidad, idioma) y sus dos piezas propias:
el re-anclaje del perfil de ciclo y el borrado total.

## Decisiones base

- **Editar el perfil de ciclo re-ancla el motor:** cambiar longitudes/regularidad/método
  crea **nueva fila** de intención (mismo modo, vigencia nueva) — el historial explica
  los cambios de patrón; siempre recalcula. Nunca se editan filas históricas.
- **Tema e idioma siguen al sistema por defecto;** el tema puede fijarse
  (`app_settings.theme`); el idioma se muestra informativo ("sigue el idioma del
  sistema") en v1.
- **Borrar todo = borrar todo:** doble confirmación explícita (mostrando qué se pierde)
  → wipe + rotación de la clave de cifrado (plan 15) + cancelar notificaciones →
  onboarding. Se **ofrece** exportar antes (plan 14), no se impone.
- **La privacidad se muestra, no se presume:** la pantalla de privacidad dice qué
  protege cada capa con estado real — cifrado activo (plan 15), bloqueo de app
  (`app_lock_enabled` + `expo-local-authentication`, challenge al abrir/volver con
  gracia de 30 s), notificaciones discretas, calendario discreto, cero red.

## Secciones (dueño del detalle)

| Sección                 | Contenido                                                                     | Dueño                |
| ----------------------- | ----------------------------------------------------------------------------- | -------------------- |
| Perfil                  | Nombre, año de nacimiento                                                     | aquí                 |
| Modo                    | Modo vigente + "Cambiar modo"                                                 | plan 10              |
| Perfil de ciclo         | Longitudes declaradas, regularidad, método anticonceptivo                     | aquí (re-anclaje)    |
| Embarazo (solo en modo) | Fechas/datación, finalizar episodio                                           | plan 09              |
| Medicamentos            | CRUD del catálogo + `pregnancy_safety`                                        | plan 02 (mutaciones) |
| Notificaciones          | Master + toggles por tipo, ventana/intervalo, discretas                       | plan 12              |
| Apariencia              | Tema (sistema/claro/oscuro), unidad de temperatura                            | aquí                 |
| Privacidad y datos      | Estado de cifrado, bloqueo de app, calendario discreto, exportar, borrar todo | aquí + planes 14/15  |
| Fuentes                 | Fuentes del contenido con fecha de revisión                                   | plan 11              |
| Acerca de               | Versión, filosofía (local-first, sin anuncios), descargo médico, licencias    | aquí                 |

## Fases

### [ ] Fase 1: Índice + secciones propias (incremental desde M2)

- **Objetivo:** que cada feature tenga dónde colgar su sección al llegar.
- **Cambios:** mockup (`docs/design-system/screens/settings.html`); pantalla índice +
  perfil + apariencia (mutaciones de `app_settings`/`user_profile` + live query; el
  ThemeProvider pasa a leer `app_settings.theme`); acerca de (con descargo médico).
- **No hacer:** secciones cuyos dueños no llegaron.
- **Cierre:** cambiar tema se refleja al instante; typecheck/tests.

### [ ] Fase 2: Perfil de ciclo con re-anclaje

- **Objetivo:** editar lo declarado sin corromper la historia.
- **Cambios:** pantalla `cycle-profile` (reusa controles del onboarding, incluido el
  picker de método) + mutación que crea nueva fila de intención y recalcula.
- **No hacer:** editar filas históricas.
- **Cierre:** test de integración — editar longitudes crea fila nueva, cierra la
  anterior y la predicción cambia coherentemente.

### [ ] Fase 3 (M7): Privacidad completa + borrado

- **Objetivo:** el panel de confianza, entero y verificable.
- **Cambios:** pantalla de privacidad (estados reales de cifrado/lock/discreción +
  toggles); bloqueo de app con `expo-local-authentication` (challenge en `_layout` con
  gracia); flujo borrar-todo (doble confirmación → wipe + rotación de clave + cancelar
  notificaciones → onboarding); consolidación de todas las secciones.
- **No hacer:** PIN propio de la app (el del sistema basta; sin biometría ni credencial,
  el toggle se deshabilita con explicación).
- **Cierre:** QA en dispositivo — lock al volver de background; borrar todo deja la app
  como recién instalada (seeds re-siembran, cero notificaciones pendientes); copy es/en.

## Riesgos y preguntas abiertas

- **Bloqueo y ergonomía:** la gracia de 30 s evita el challenge en cada cambio de app;
  medir molestia real antes de hacerla configurable.
- **Borrar todo con backup reciente:** el flujo menciona la fecha del último export
  (`last_backup_at`) para decidir con información — sin presionar.
