import { createStyles } from "@/theme/createStyles";

const ITEM_HEIGHT = 40;
const VISIBLE_COUNT = 5;

/**
 * WheelPicker = SOLO la columna scrolleable (sin caja ni banda). El marco
 * blanco y la banda de selección los provee `WheelGroup`, para que varias
 * columnas (día/mes/año, hora inicio/fin) se lean como UN control cohesivo.
 */
export const useWheelPickerStyles = createStyles((theme) => {
    const { colors, typography } = theme;

    return {
        // Reparte el ancho entre columnas hermanas (día/mes/año, hora inicio/fin).
        column: {
            flex: 1,
        },
        // Altura explícita = la ventana del control. Sin esto el ScrollView no tiene
        // alto acotado dentro de `WheelGroup` y colapsa (se veía solo la caja vacía).
        scroll: {
            height: ITEM_HEIGHT * VISIBLE_COUNT,
        },
        scrollContent: {
            paddingVertical: ITEM_HEIGHT * 2,
        },
        itemFar: {
            height: ITEM_HEIGHT,
            lineHeight: ITEM_HEIGHT,
            fontSize: typography.sizes.caption + 1,
            fontFamily: typography.families.sans,
            color: colors.placeholder,
            textAlign: "center",
        },
        itemNear: {
            height: ITEM_HEIGHT,
            lineHeight: ITEM_HEIGHT,
            fontSize: typography.sizes.body,
            fontFamily: typography.families.sans,
            color: colors.textSecondary,
            textAlign: "center",
        },
        itemCenter: {
            height: ITEM_HEIGHT,
            lineHeight: ITEM_HEIGHT,
            fontSize: typography.sizes.h3,
            fontFamily: typography.families.heading,
            color: colors.link,
            textAlign: "center",
        },
    };
});

export const WHEEL_ITEM_HEIGHT = ITEM_HEIGHT;
export const WHEEL_VISIBLE_COUNT = VISIBLE_COUNT;
