# REA

REA es una app para acompañar tu ciclo menstrual y tu embarazo. Es gratuita para
siempre, no muestra anuncios y no pide cuenta: todo lo que registras vive en tu
teléfono y en ningún otro sitio. Está en construcción — esta página cuenta qué es, qué
hará y en qué punto va.

## Por qué existe

Las apps de periodo más conocidas cobran suscripción por funciones básicas, entierran
el calendario bajo publicidad o comercian con datos íntimos. REA nace de ver eso de
cerca: alguien concreto necesitaba registrar su ciclo sin pagar, sin anuncios y sin
regalar su información. Se construye para ella primero, y para cualquiera que quiera lo
mismo.

No hay modelo de negocio. No hay nada que monetizar. Por eso no existe ningún incentivo
para traicionar a quien la usa.

## Qué hace REA por ti

REA se adapta a tu momento. Eliges un modo al empezar y puedes cambiarlo cuando tu vida
cambie, sin perder nada de lo registrado.

- **Entender tu ciclo**: registras lo que sientes en menos de un minuto al día
  (sangrado, ánimo, dolor, síntomas) y REA te devuelve tu patrón: en qué fase estás,
  cuándo llegará tu regla y qué es típico en ti.
- **Evitar un embarazo**: REA te muestra tu ventana fértil con un marco deliberadamente
  prudente, y te lo dice sin rodeos: esta información apoya tu conciencia del ciclo,
  **no** es un método anticonceptivo.
- **Buscar un embarazo**: temperatura basal, tests de ovulación y moco cervical se
  convierten en una gráfica que confirma tu ovulación, con un tono que acompaña sin
  presionar.
- **Seguir tu embarazo**: tu semana, el desarrollo del bebé y contenido semanal con
  fuentes. Y si el embarazo no llega a término, REA responde con silencio y respeto,
  no con recordatorios crueles.

Todo lo anterior viene acompañado de **contenido con fuente citada**: consejos y
educación que se muestran cuando vienen al caso. REA recomienda y explica; nunca
diagnostica. Ante cualquier señal seria, su respuesta es siempre la misma: consulta a
tu profesional de salud.

### Predicciones que no mienten

Toda estimación muestra en qué se basa y cuánta confianza tiene. Si REA no sabe, dice
"no lo sé todavía" en lugar de inventar una fecha. Y se deja medir: una estadística
propia te muestra cuántos días se equivocó en sus últimas predicciones.

## Tu privacidad, sin letra pequeña

Cada promesa tiene su mecanismo. Así se protege tu información, capa por capa:

| Capa                      | Qué protege                                                           | Estado          |
| ------------------------- | --------------------------------------------------------------------- | --------------- |
| Sin internet              | La app no tiene permiso de red: tus datos no pueden salir             | En construcción |
| Cifrado en el dispositivo | La base de datos es ilegible sin la clave guardada en tu teléfono     | En construcción |
| Bloqueo de app            | Nadie con tu teléfono en la mano abre REA sin tu huella o PIN         | Planificado     |
| Notificaciones discretas  | La pantalla bloqueada nunca muestra "ventana fértil" ni similares     | Planificado     |
| Exportar y borrar todo    | Te llevas tus datos cuando quieras y los borras sin dar explicaciones | Planificado     |

Dos aclaraciones honestas: el bloqueo de app protege la pantalla, no el disco (para eso
está el cifrado), y el archivo que exportas sale sin cifrar para que puedas usarlo —
guárdalo en un lugar seguro.

## Lo que REA nunca hará

Sin suscripciones ni compras. Sin anuncios. Sin cuentas ni registro. Sin subir tus
datos a ningún servidor. Sin vender ni compartir información. Sin diagnósticos. Sin
culparte por dejar de registrar.

## Estado del proyecto

REA está en construcción activa. Los principios de arriba están cerrados; casi todo lo
demás se está decidiendo y diseñando.

- **Hoy funciona**: la configuración inicial (elegir modo, declarar tu ciclo o tu
  embarazo), la base de datos, los idiomas (español e inglés) y el tema claro/oscuro.
- **En camino, por orden**: cifrado y motor de predicción → registro diario y diario →
  pantallas de Hoy y calendario (con la semana de embarazo incluida) → estadísticas →
  fertilidad avanzada → embarazo completo → contenido, respaldo y bloqueo de app.

El detalle técnico de ese orden vive en el [roadmap por hitos](docs/features/README.md).

## Principios

| Principio               | En la práctica                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------- |
| Local primero           | SQLite cifrada en el dispositivo; cero red, cero telemetría, cero cuentas           |
| Gratis de verdad        | Ninguna función diseñada para convertir ni retener                                  |
| Predicción honesta      | Toda estimación expone su base y su confianza; el error se mide y se muestra        |
| No diagnostica          | Recomienda con fuentes; ante señales serias, "consulta a tu profesional"            |
| Cada dato alimenta algo | No se pide un dato que no termine en una estadística, una predicción o un contenido |
| Privacidad verificable  | Cada promesa de privacidad tiene un mecanismo comprobable, no una intención         |
| Calma                   | Visual suave (celeste, sin alarmismo), copy breve y cálido, cero presión            |

## Para quien desarrolla

Stack: Expo (React Native) + TypeScript + expo-router + SQLite (expo-sqlite + Drizzle)

- Zustand efímero + i18next. Arquitectura por features con una capa de dominio puro
  (`src/domain/`: motor de ciclo, proyecciones, estadísticas) y lectura/escritura
  separadas (CQRS-lite: hechos normalizados → proyecciones `daily_summary`,
  `cycle_predictions`, `cycle_records`).

| Documento                                            | Qué contiene                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| [`docs/auditoria.md`](docs/auditoria.md)             | Auditoría técnica: hallazgos, esquema v3, prioridades        |
| [`docs/features/README.md`](docs/features/README.md) | Índice de planes, arquitectura de información, roadmap       |
| [`docs/features/NN-*.md`](docs/features/)            | Plan por feature: contexto → decisiones → fases verificables |
| [`DESIGN.md`](DESIGN.md)                             | Dirección visual y contratos de componente                   |
| `docs/design-system/`                                | Design system navegable + mockups por pantalla               |
| `.agents/skills/standards-rea-*`                     | Estándares de estructura, estilo y testing                   |

Flujo por feature: mockup HTML aprobado → esquema/datos → dominio puro con tests →
mutaciones/queries → UI → integración. Gates: `npm run typecheck`, `npm run lint`,
`npm run test`.
