import { createStyles } from "@/theme/createStyles";

import { WHEEL_ITEM_HEIGHT, WHEEL_VISIBLE_COUNT } from "../wheel-picker/WheelPickerStyle";

export const useWheelGroupStyles = createStyles((theme) => {
    const { colors, radius, borderWidth, spacing } = theme;

    return {
        group: {
            position: "relative",
            height: WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_COUNT,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            borderRadius: radius.lg,
            backgroundColor: colors.background,
            overflow: "hidden",
            justifyContent: "center",
        },
        // Altura explícita = ventana del control. El `group` centra su contenido
        // (justifyContent), así que sin alto la fila colapsa a 0 y las columnas
        // (flexBasis 0) recortan el ScrollView → se veía solo la caja vacía.
        row: {
            flexDirection: "row",
            height: WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_COUNT,
        },
        // Banda de selección fina centrada, una sola para todas las columnas.
        band: {
            position: "absolute",
            left: spacing.md,
            right: spacing.md,
            top: "50%",
            height: WHEEL_ITEM_HEIGHT,
            marginTop: -WHEEL_ITEM_HEIGHT / 2,
            borderRadius: radius.md,
            borderWidth: borderWidth.thin,
            borderColor: colors.primaryPressed,
            backgroundColor: colors.primarySubtle,
        },
    };
});
