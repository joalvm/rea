---
name: standards-rea-code-style
description: "Use when writing or reviewing code in Rea, deciding exports, comments, typing, componentization, or React Native code style. Triggers: export default, comentarios descriptivos, props inline, types separados, componentizacion, hooks por ambito, estilo de codigo, claridad."
---

# Rea Code Style

## Objetivo

Definir como se escribe codigo en Rea para que se lea rapido, tenga dueño claro y mantenga coherencia entre agentes y programadores.

## Mantra

Orden y claridad en codigo.

## Exports

- Priorizar `export default` cuando archivo tenga un unico elemento exportable principal.
- Si helper, tipo o constante solo sirve a su dueño, no exportarlo.
- Si archivo necesita elemento principal y complementos reutilizados, dejar principal con `export default` y complementos con `export` nombrado.
- Si multiples exports nombrados empiezan a competir por protagonismo, separar archivo.

## Tipos

- Props de cualquier componente React viven en mismo archivo que su dueño.
- Orden obligatorio en archivo React: imports, definicion de `Props`, componente, helpers locales si hacen falta.
- `*.types.ts` no se usa para guardar un `FooProps` suelto.
- Si un componente importa solo sus props desde un `*.types.ts` hermano, al tocarlo hay que devolver esas props al archivo del componente.
- Tipos e interfaces no triviales que no sean props y si se compartan entre varios archivos del ambito pueden vivir en `*.types.ts`.
- Tipos compartidos van a `src/types/`.
- Tipos locales se quedan junto a su dueño.

## Componentizacion

- Screen grande debe leerse como composicion, no como archivo omnibus.
- No declarar subcomponentes grandes dentro de screens grandes.
- Subcomponentes visuales exclusivos van a `components/` del ambito.
- Hooks van al ambito real del componente o pantalla que los usa.
- Helpers puros salen del componente si no dependen de React.
- Screen, feature, scene de `app/`, modal, card, row o bloque reutilizable define sus props justo arriba del componente.
- No separar por moda. Separar cuando mejora lectura, mantenimiento o responsabilidad.

## React y React Native

- Seguir imports directos y rutas estaticas.
- No usar barrels.
- No mover derivaciones simples a effects.
- Estado derivado en render cuando sea suficiente.
- Hooks con dueño claro.
- Evitar componentes inline grandes dentro de otros componentes.
- Archivo React debe poder leerse de arriba hacia abajo sin saltar a `*.types.ts` para entender props basicas.
- Priorizar nombres semanticos y responsabilidades cortas.

## Comentarios

- Cada tipo exportado debe explicar que representa y donde aplica.
- Cada funcion exportada debe explicar para que sirve y cuando se usa.
- Cada componente exportado debe explicar que bloque de UI representa y su responsabilidad.
- Cada helper no trivial debe explicar por que existe.
- Cada hook debe explicar que estado o efectos encapsula.
- Cada repositorio o servicio debe explicar que entidad o flujo maneja.
- Comentarios deben ser descriptivos, utiles y breves.
- No comentar lo obvio. No narrar sintaxis.

## Nombres

- Componentes en PascalCase.
- Hooks con prefijo `use`.
- Helpers con nombre orientado a responsabilidad.
- Evitar `helpers`, `common`, `misc`, `temp`, `new`.

## Estilos

- `*.styles.ts` para screens, modales y componentes grandes.
- Componentes pequenos pueden mantener estilos en mismo archivo.
- No extraer estilos si no mejora lectura real.

## Checklist rapido

- principal export usa `export default` cuando corresponde
- complementos innecesarios no se exportan
- props React estan en mismo archivo y antes del componente
- `*.types.ts` no se usa como deposito de props aisladas
- tipos no-props compartidos estan separados cuando de verdad aportan claridad
- comentarios explican proposito
- componente principal se entiende leyendo arriba hacia abajo
- helpers y hooks tienen dueño claro
