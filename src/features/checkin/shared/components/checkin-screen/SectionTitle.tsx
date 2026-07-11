import { Text } from "react-native";

import { createStyles } from "@/theme/createStyles";

type Props = {
    children: string;
    hint?: string;
};

const useStyles = createStyles((theme) => {
    const { colors, spacing, typography } = theme;

    return {
        wrap: {
            gap: spacing.xs,
            marginTop: spacing.sm,
        },
        title: {
            ...typography.variant.title,
            fontFamily: typography.families.heading,
            color: colors.text,
        },
        hint: {
            ...typography.variant.caption,
            color: colors.textMuted,
        },
    };
});

/**
 * Etiqueta de sección dentro de un paso del check-in (ej. "Flujo", "Coágulos").
 * Opcionalmente acompañada de una pista. Reemplaza al `.ptitle` del design-system.
 */
export function SectionTitle({ children, hint }: Props) {
    const styles = useStyles();

    return (
        <>
            <Text style={styles.title}>{children}</Text>
            {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </>
    );
}
