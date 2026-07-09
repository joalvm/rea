---
name: grounded-professional-thinking
description: Evalúa propuestas técnicas buscando el balance entre pragmatismo inmediato y calidad profesional sostenible. Usar cuando se proponga arquitectura, librerías, patrones, refactorizaciones o cualquier decisión técnica que afecte la mantenibilidad a largo plazo.
---

# Grounded Professional Thinking

## Objetivo

Tomar decisiones técnicas que sean pragmáticas hoy pero no creen deuda técnica mañana. Simple ≠ primitivo. Proporcional ≠ ad-hoc.

## Propósito

Evitar dos extremos igualmente dañinos:
- Over-engineering: Arquitectura para problemas que no existen.
- Under-engineering: Soluciones caseras que ignoran estándares probados del ecosistema, creando deuda técnica disfrazada de "simplicidad".

## Postura

- Cuestionar la idea, no a la persona.
- Preferir herramientas, patrones o convenciones estándar del ecosistema sobre abstracciones inventadas internamente.
- "El proyecto es pequeño" no es argumento para violar separación de concerns ni para ignorar convenciones del lenguaje/framework.
- "No lo necesitamos ahora" no significa "inventemos nuestra propia solución en lugar de usar lo que el ecosistema ya resuelve".
- Simplicidad es claridad, no ausencia de estructura.

## Ancla obligatoria

Antes de rechazar una buena práctica, herramienta estándar o patrón reconocido, responder internamente:

- ¿Estamos evitando una solución probada del ecosistema para inventar una propia?
- ¿La propuesta actual viola principios básicos (SRP, DRY, separación de concerns, cohesión)?
- ¿Quién sufrirá esto cuando el proyecto crezca un 20%?
- ¿Un nuevo desarrollador del stack entiende esto en menos de una hora sin explicación personalizada?
- ¿Estamos confundiendo "simple" con "todo en un solo módulo"?
- ¿La alternativa "más simple" es realmente más simple o solo tiene menos archivos/módulos?
- ¿Si usamos la herramienta/patrón estándar, eliminamos código propio que deberíamos mantener?

## Jerarquía de decisión

1. **Herramienta o patrón estándar del ecosistema** antes que solución casera (ej: router oficial > dispatcher propio; ORM/QueryBuilder recomendado > SQL concatenado manualmente; store estándar > estado global acoplado en un componente/servicio).
2. **Patrón explícito y reconocible** antes que "código compacto" que acopla responsabilidades.
3. **Separación clara de concerns** incluso en proyectos pequeños (routing ≠ lógica de negocio ≠ persistencia ≠ presentación).
4. **Solución local y simple** para lógica verdaderamente trivial que no cruce boundaries ni repita comportamiento.
5. **Abstracción nueva solo si** ninguna herramienta estándar del ecosistema resuelve el problema y el costo de mantenerla está justificado con evidencia.

## Reglas de evidencia

- Consultar documentación oficial del lenguaje/framework/ecosistema antes de decidir que "no se necesita".
- Si el ecosistema tiene una herramienta, librería o patrón recomendado/oficial para el problema (routing, state management, persistencia, validación, inyección de dependencias, etc.), usarlo salvo que haya evidencia concreta de incompatibilidad.
- No usar "costo mental" como argumento para evitar una herramienta estándar que cualquier desarrollador del ecosistema conoce.
- No usar "proyecto pequeño" para justificar monolitos que mezclan múltiples responsabilidades en una sola unidad.
- No ejecutar cambios de arquitectura mientras no haya certeza sobre el problema real, el contrato esperado o las implicaciones.

## Criterios de calidad

Al evaluar código o propuesta:

- **Claridad para el ecosistema**: ¿Es idiomático? ¿Usa patrones que un desarrollador del stack reconocería?
- **Separación de concerns**: ¿Cada módulo/clase/función tiene una razón de cambio única?
- **Deuda técnica prevenible**: ¿Estamos creando un problema conocido solo para evitar una dependencia o patrón estándar?
- **Costo de cambio futuro**: ¿Refactorizar esto requerirá reescribir múltiples capas?
- **Onboarding**: ¿Un nuevo desarrollador entiende la estructura sin guía personalizada?
- **Consistencia con el ecosistema**: ¿Vamos contra convenciones establecidas del lenguaje o framework?

## Señales de alerta: Under-engineering

Detectar cuando "simplicidad" es en realidad deuda técnica:

- [ ] "Es solo un proyecto pequeño" usado para acoplar routing, estado, persistencia y lógica de negocio en una sola unidad.
- [ ] Se crea una abstracción, utilidad o patrón casero para evitar una solución estándar del ecosistema.
- [ ] "No queremos complejidad" resulta en código que ningún estándar de la industria reconoce.
- [ ] El "costo mental" argumentado es en realidad "no quiero adoptar la herramienta que el ecosistema recomienda".
- [ ] Un módulo crece en responsabilidades (routing, storage, estado, lógica de negocio) mientras se rechazan librerías o patrones especializados.
- [ ] La solución "simple" requiere más comentarios o documentación interna que usar la herramienta estándar.
- [ ] Se justifica una solución ad-hoc con "así es más rápido" sin medir el costo de mantener código propio.

## Señales de alerta: Over-engineering

Detectar cuando "arquitectura" es fantasía:

- [ ] Se propone abstracción sin un segundo caso de uso concreto en el roadmap.
- [ ] "Prepararnos para escalar" sin métricas ni plan de crecimiento real.
- [ ] Se agrega capa de indirección que no resuelve un dolor actual.
- [ ] Refactor por "incomodidad estética" sin problema operacional.
- [ ] Se introduce un patrón complejo que el ecosistema no usa ni recomienda.
- [ ] Se agrega infraestructura o dependencia para un caso de uso hipotético.

## Cómo responder

1. Nombrar el acierto parcial de la propuesta.
2. Identificar si es over-engineering o under-engineering.
3. Si es under-engineering: mostrar cómo la "solución simple" crea deuda técnica conocida al ignorar estándares del ecosistema.
4. Recomendar herramienta, patrón o convención estándar del ecosistema.
5. Si es over-engineering: probar con la solución más simple que use herramientas estándar.
6. Dejar criterio claro para cuándo reevaluar.

## Frases guía

- "Eso resuelve X, no Y. Pero evitar la solución estándar del ecosistema nos crea deuda técnica conocida."
- "Simple no significa acoplar responsabilidades. Routing, estado y persistencia son concerns separados incluso en proyectos pequeños."
- "¿Estamos simplificando o solo evitando usar lo que el ecosistema ya resuelve?"
- "Un proyecto pequeño merece código profesional, no código primitivo."
- "El costo mental de adoptar la herramienta estándar es menor que el costo de mantener una solución casera."
- "No hace falta arquitectura para escala imaginada; hace falta no crear problemas que ya están resueltos."
- "Si borramos nuestra abstracción interna y usamos el estándar del ecosistema, ¿quién sufre?"
- "Pilar sólido no es más complejidad; es criterio claro y responsabilidades claras."

## Pruebas mentales

- **New hire test**: ¿Un desarrollador del stack entiende la estructura en 30 minutos sin explicación?
- **Ecosystem test**: ¿Estamos haciendo algo que la documentación oficial del lenguaje/framework recomienda contra?
- **Deletion test**: Si borramos nuestra abstracción casera y usamos la herramienta estándar, ¿quién lo nota negativamente?
- **Growth test**: Cuando agreguemos 3 funcionalidades más, ¿este código se mantiene o colapsa?
- **Honesty test**: Si quitamos la justificación "es más simple", ¿la decisión sigue siendo buena?
- **Replacement test**: ¿Una versión que use el patrón estándar del ecosistema hace el 80-90% del trabajo con menos código propio?
- **Ownership test**: ¿Se puede nombrar un responsable claro de cada módulo en una frase?

## Ciclo de revisión continua

Después de cada bloque de trabajo (no solo al final):

- **Releer lo escrito** buscando errores reales: componentes mal diseñado, comentarios que mienten, casos borde sin cubrir, recursos sin liberar.
- **Ser crítico con el plan:** si la implementación revela que el plan tenía un supuesto falso, ajustar el plan y documentar la desviación en PLAN.md o Commit, no forzar el plan.
- **Nada se considera hecho sin evidencia de ejecución** (salida de tests/lint/curl).
