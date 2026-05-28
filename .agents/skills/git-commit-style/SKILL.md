---
name: git-commit-style
description: Convención del repo para redactar commits claros, descriptivos y consistentes. Úsalo antes de crear cualquier commit.
---

# Git Commit Style

## Objetivo

Mantener commits claros, útiles al leer historial y fáciles de entender sin abrir el diff completo.

## Título

- debe ser general y descriptivo
- preferir hasta `120` caracteres
- debe cubrir el cambio principal del commit, no cada archivo
- escribir en español
- tono claro y preciso
- evitar títulos vagos como:
  - `fix`
  - `cambios`
  - `ajustes varios`

## Descripción

- escribir en español
- explicar qué se cambió y por qué se cambió
- ser detallado, pero sin explayarse demasiado
- evitar redundancia
- no bajar a detalle excesivamente técnico si no aporta

## Forma recomendada

- cambios pequeños o muy ligados:
  - un solo bloque corto
- cambios múltiples o de áreas distintas:
  - lista plana
  - cada item explica cambio y motivo

## Qué priorizar

- intención del cambio
- impacto funcional o de mantenimiento
- criterio usado para estructurarlo

## Qué evitar

- inventario archivo por archivo sin contexto
- descripción puramente técnica sin explicar propósito
- repetir en el cuerpo exactamente lo mismo que ya dice el título
- mensajes demasiado crípticos o demasiado largos

## Plantillas

### Cambio pequeño

```txt
<titulo descriptivo general>

<bloque corto explicando que se hizo y por que se hizo>
```

### Cambios múltiples

```txt
<titulo descriptivo general>

- <cambio 1 y motivo>
- <cambio 2 y motivo>
- <cambio 3 y motivo>
```

## Antes de confirmar el commit

- revisar que el staged diff sea coherente
- asegurar que el título cubra el eje principal del cambio
- asegurar que el cuerpo explique intención y motivo
- si aplica, correr validaciones del repo antes de confirmar
