# AGENTS

## Producto

- Rea es app movil privada para seguimiento menstrual y bienestar diario.
- Prioridad: utilidad real, honestidad clinica, privacidad y tono sereno.
- No convertir producto en diagnostico ni en predictor fertil con precision falsa.

## Reglas de diseño

- Mantener UX suave, minimalista, aire editorial, baja densidad visual.
- Cada bloque en pantalla debe justificar su existencia.
- Evitar estetica generica de app femenina, exceso de cards, exceso de copy y dashboards ruidosos.
- `colors.primary` en src/theme.ts es intocable. Fue elegido por usuaria principal.
- Resto de paleta si puede ajustarse para mejorar armonia visual.

## Reglas de producto

- Diferenciar siempre entre dato observado, dato estimado y dato desconocido.
- No mostrar precision fertil falsa ni afirmaciones clinicas fuertes.
- Si nueva entrada de datos no se usa despues para insight o decision real, no agregarla.
- Primero optimizar para usuaria principal; despues validar con mas usuarias reales.

## Reglas tecnicas

- Mantener enfoque local-first. No introducir backend, nube o analytics sin pedirlo explicitamente.
- Antes de refactors estructurales amplios, comparar proyecto con convenciones actuales de Expo y React Native.
- No mover carpetas o entrypoints por inercia antigua; justificar cualquier desviacion del template y guias vigentes.
- Corregir raiz del problema. Evitar parches cosmeticos si modelo de datos o flujo siguen debiles.

## Flujo de trabajo

- Trabajar por pasos cerrables. Validar despues de cada corte importante.
- Cuando un paso completo termine, correr pruebas y hacer commit solo si todo pasa.
- Antes de cualquier commit, seguir estilo definido en .agents/skills/git-commit-style/SKILL.md.
- Commits: en espanol, claros, descriptivos. Nunca mencionar planes, roadmap ni agentes.

## Archivos locales de trabajo

- No commitear ROADMAP.md.
- No commitear archivos de plan, notas de trabajo o documentos equivalentes.
