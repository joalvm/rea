# Skills

Skills pequeñas, directas y reutilizables. Una skill por capacidad.

## Git

- `git-commit-style`
    - Convención del repo para redactar títulos y descripciones de commits

## Standards

- `standards-rea-code-structure`
    - Reglas de carpetas, capas, imports, ubicacion de archivos y colocacion de props/tipos para Rea
- `standards-rea-code-style`
    - Reglas de exports, comentarios, props inline, tipado y componentizacion para Rea
- `standards-rea-testing`
    - Estándar del repo para estrategia, arquitectura y escritura de tests: unit, integration, stores, services, UI, i18n, DB y e2e

## Planning

- `grounded-plan-building`
    - Cómo estructurar trabajo por fases una vez que la idea ya merece avanzar
- `grounded-professional-thinking`
    - Cómo evaluar ideas y planes con criterio profesional

## Regla clave actual

- Props de componentes React viven en mismo archivo que su dueño.
- Orden obligatorio: definicion de props primero, componente despues.
- `*.types.ts` no se usa para dejar un solo `FooProps` aislado.
- Imports y requires van siempre al inicio. Primero `import`, luego `require` solo si queda una excepcion real.
- Preferir alias `@/` y `@assets/` antes que rutas con muchos `../../..` al salir del ambito local.
- Assets estaticos deben entrar por `import`, no por `require`, salvo limitacion concreta del bundler o API.
