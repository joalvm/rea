/**
 * Valores persistibles para el tema visual de la app.
 * Se usan en esquemas Drizzle, defaults y controles de seleccion de apariencia.
 */
export const appThemeValues = ["system", "light", "dark"] as const;

/**
 * Valores persistibles para la unidad de temperatura mostrada a la usuaria.
 * Se usan en settings, lectura de temperatura basal y cualquier form que exponga la preferencia.
 */
export const temperatureUnitValues = ["celsius", "fahrenheit"] as const;

/**
 * Union literal del tema visual permitido en la app.
 * Importar este tipo cuando el contrato acepte exactamente uno de los valores de `appThemeValues`.
 */
export type AppTheme = (typeof appThemeValues)[number];

/**
 * Union literal de la unidad de temperatura admitida por la configuracion local.
 * Importar este tipo cuando una API o componente deba tipar la preferencia derivada de `temperatureUnitValues`.
 */
export type TemperatureUnit = (typeof temperatureUnitValues)[number];
