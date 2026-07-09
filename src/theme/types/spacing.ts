/** Escala de espaciado (múltiplos de 4). Clave = paso, valor = px. */
export type Space = {
    none: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    "2xl": number;
    "3xl": number;
    "4xl": number;
    "5xl": number;
    "6xl": number;
};

/** Tamaños de elementos comunes (controles, iconos, áreas táctiles). */
export type Sizing = {
    /** Controles (botones, inputs, etc.). */
    controlSm: number;
    controlMd: number;
    controlLg: number;

    /** Área táctil mínima recomendada (iOS HIG / Material). */
    minTouch: number;

    /** Iconos (tamaños nominales, no incluyen padding). */
    iconXs: number;
    iconSm: number;
    iconMd: number;
    iconLg: number;
    iconXl: number;

    /** Altura nominal de la barra de pestañas (sin safe-area). */
    tabBar: number;

    /** Ancho máximo de columna de lectura para textos largos. */
    readableMaxWidth: number;
};
