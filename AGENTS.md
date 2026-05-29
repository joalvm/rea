# AGENTS

## Producto

- Rea es app movil privada para seguimiento menstrual y bienestar diario.
- Prioridad: utilidad real, honestidad clinica, privacidad y tono sereno.
- No convertir producto en diagnostico ni en predictor fertil con precision falsa.

## Estado actual

- Motor base ya diferencia observado, estimado y confianza; usa historial real para dar contexto mejor que una heuristica fija.
- Pantalla Hoy ya tiene direccion aprobada: hero editorial con tema por fase, burbujas discretas, lectura principal clara y CTA emocional. No rehacer esa estructura desde cero sin pedido explicito.
- Patrones y alertas educativas ya existen, pero siguen pendientes spotting entre periodos, fiebre y tendencia de empeoramiento si esos datos no se capturan mejor.
- Build local Android sin cuenta Expo ya fue validado para uso personal.

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
- Props de componentes React viven con su dueño: mismo archivo, definicion primero, componente despues.
- No crear `*.types.ts` solo para props de screen, feature, modal, row, card o componente compartido.
- Si se toca versionado o build Android, mantener sincronizados `package.json`, `package-lock.json` y `app.json`.
- Artefactos Android locales deben salir con nombre versionado visible y alias estable para ultimo build.

## Reglas de documentacion

- README debe explicar que es Rea, que hace, que no promete y como se protege privacidad.
- README no debe convertirse en manual tecnico; dejar detalle tecnico solo en tramo final para contribuidores.
- ROADMAP.md sigue siendo archivo local de trabajo. Mantenerlo breve y borrarlo cuando ya no tenga pendientes reales.

## Reglas de repositorio

- Asumir `master` como rama protegida en remoto.
- Para futuras colaboraciones, preferir ramas + pull request + checks de validacion.
- Mantener `validate` como check requerido de rama principal.
- Mantener squash merge como camino normal de integracion en remoto.
- Asumir commits firmados como requisito para pushes directos a `master`.
- No depender de force-push ni de borrar rama principal para flujos normales.

## Flujo de trabajo

- Trabajar por pasos cerrables. Validar despues de cada corte importante.
- Cuando un paso completo termine, correr pruebas y hacer commit solo si todo pasa.
- Antes de cualquier commit, seguir estilo definido en .agents/skills/git-commit-style/SKILL.md.
- Commits: en espanol, claros, descriptivos. Nunca mencionar planes, roadmap ni agentes.

## Archivos locales de trabajo

- No commitear ROADMAP.md.
- No commitear archivos de plan, notas de trabajo o documentos equivalentes.
