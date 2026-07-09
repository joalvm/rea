/** Tokens de interacción compartidos: opacidades y escala de feedback táctil. */
export type State = {
    /** Opacidad de elementos deshabilitados (HIG/MD: 0.38–0.5). */
    disabledOpacity: number;
    /** Opacidad de relleno en estado presionado. */
    pressedOpacity: number;
    /** Escala aplicada al presionar (feedback de press). */
    pressedScale: number;
};
