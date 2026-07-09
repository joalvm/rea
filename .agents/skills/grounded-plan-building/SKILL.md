---
name: grounded-plan-building
description: Construye planes aterrizados, legibles en una sola pasada y anti-sobreingeniería. Úsalo cuando una idea ya merezca avanzar y usuario pida roadmap, plan por fases, migración, refactor grande, reorganización, estrategia de implementación, desglose de una idea o cualquier secuencia de cambio que deba volverse concreta, proporcional y ejecutable.
---

# Grounded Plan Building

## Objetivo

Convertir una idea en un plan corto, ejecutable y proporcional al problema real del proyecto.

## Propósito

Esta skill existe para evitar dos errores comunes:

- planear demasiado para un problema pequeño;
- ordenar trabajo sin explicar por qué ese trabajo conviene.

Un buen plan no impresiona. Un buen plan aclara.

## Alcance

Esta skill sirve para estructurar trabajo una vez que la idea ya pasó filtro inicial de conveniencia.

- si todavía no está claro si la idea conviene, usar primero `grounded-professional-thinking`;
- esta skill ordena cambio, no decide por sí sola si el cambio debe existir.

## Regla principal

No planear herramienta, moda o estructura primero. Planear problema, objetivo, costo, límites y validación primero.

## Antes de escribir un plan

- localizar anclas concretas del estado actual;
- nombrar dolor real de hoy, no futuro imaginado;
- nombrar ganancia buscada;
- decir que queda fuera del cambio;
- si el cambio puede ejecutarse ya sin plan largo, no inflar plan.

## Forma del plan

- contexto arriba;
- fases abajo;
- cada fase en su propio título: `### [ ] Fase N: ...`;
- no crear checklist aparte;
- máximo `4-6` fases;
- cada fase debe poder leerse sin saltar a otra sección;
- una sola pasada debe bastar para entender orden, criterio y alcance.

## Qué debe incluir

### Contexto

- estado actual del proyecto o sistema;
- problema real;
- restricciones del producto, negocio o entorno técnico;
- piezas ya separadas y piezas que aún duelen.

### Decisiones base

- principios que no se negocian;
- límites claros sobre lo que no se va a introducir por estética, costumbre o ansiedad.

### Criterios de entrada

- para cualquier dependencia, refactor, capa estructural o cambio opcional;
- si no hay criterio de entrada, no hay fase para ese cambio.

### Fases

Cada fase debe tener:

- objetivo;
- cambios;
- no hacer;
- cierre o validación verificable.

## Regla de planes locales

- ningún plan, roadmap, nota de trabajo o archivo equivalente debe entrar al repositorio salvo que usuario pida expresamente documentación versionada;
- por defecto, planes son artefactos locales de apoyo;
- no convertir un plan local en documentación del repo sin pedido explícito.

## Guardrails

- no crear fases por simetría;
- no vender como "estándar" lo que solo es moda;
- no crear estructura nueva sin problema real que la obligue;
- no convertir preferencia personal en prioridad del proyecto;
- no meter dependencias por posible necesidad futura no probada;
- no usar nombres vagos como "mejorar arquitectura" sin aterrizar archivos o contratos.

## Prioridad de soluciones

- cambio local y reversible;
- separación por responsabilidad real;
- extracción de módulo o flujo con dueño claro;
- nueva capa o dependencia solo si el problema ya la justifica.

El siguiente escalón entra solo si el anterior ya no alcanza.

## Frases guía

- "Problema real hoy:";
- "Esto fortalece pilar porque...";
- "Esto no compra valor todavía.";
- "Si esta condición no se cumple, fase termina sin introducir capa nueva.";
- "Primero X. Después evaluar si Y sigue haciendo falta.";
- "No mover por estética. Mover solo si reduce costo, riesgo o acoplamiento real.";
- "Un plan útil no solo ordena pasos; justifica por qué esos pasos existen.".

## Señales de mal plan

- más tecnología que problema;
- más fases que dueños reales;
- lenguaje abstracto sin archivos, contratos o validaciones;
- pasos que asumen crecimiento no probado;
- validación blanda o ausente;
- fases que solo hacen sentir progreso, pero no resuelven dolor actual.

## Límite de esta skill

- no usar esta skill para justificar una idea dudosa;
- no usar esta skill para convertir una intuición débil en roadmap formal.
