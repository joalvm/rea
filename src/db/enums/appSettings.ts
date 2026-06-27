export const appThemeValues = ["system", "light", "dark"] as const;

export const temperatureUnitValues = ["celsius", "fahrenheit"] as const;

export type AppTheme = (typeof appThemeValues)[number];

export type TemperatureUnit = (typeof temperatureUnitValues)[number];
