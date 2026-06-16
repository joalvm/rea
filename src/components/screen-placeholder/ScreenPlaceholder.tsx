import { Fragment } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

/** Fase del roadmap a la que pertenece la pantalla (ver docs/PLAN.md). */
export type ScreenPhase = "MVP" | "P2" | "P3" | "V1";

/** Enlace de navegación hacia otra pantalla (usado por índices como Configuración). */
export type PlaceholderLink = {
    label: string;
    onPress: () => void;
    hint?: string;
};

type Props = {
    /** Título legible de la pantalla. */
    title: string;
    /** Ruta del archivo en `src/app` para ubicarla rápido durante el desarrollo. */
    routePath?: string;
    /** Fase del roadmap. */
    phase?: ScreenPhase;
    /** Qué hará la pantalla. El detalle vive en el README de la feature. */
    description?: string;
    /** Lista de enlaces (p. ej. el índice de Configuración). */
    links?: PlaceholderLink[];
    primaryLabel?: string;
    onPrimary?: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
};

/**
 * Placeholder neutral compartido por todas las pantallas aún sin diseño.
 *
 * No define identidad visual: solo deja la pantalla navegable y autoexplicada
 * mientras se aterriza el diseño definitivo de cada feature. Sustituir por la
 * UI real cuando exista. El "qué va aquí" se documenta en el README de la feature.
 */
export default function ScreenPlaceholder({
    title,
    routePath,
    phase,
    description,
    links,
    primaryLabel,
    onPrimary,
    secondaryLabel,
    onSecondary,
}: Props) {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            {phase ? (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{phase}</Text>
                </View>
            ) : null}

            <Text style={styles.title}>{title}</Text>
            {routePath ? <Text style={styles.path}>{routePath}</Text> : null}
            {description ? <Text style={styles.description}>{description}</Text> : null}

            {links?.length ? (
                <View style={styles.links}>
                    {links.map((link) => (
                        <Fragment key={link.label}>
                            <Pressable style={styles.linkRow} onPress={link.onPress}>
                                <Text style={styles.linkLabel}>{link.label}</Text>
                                {link.hint ? <Text style={styles.linkHint}>{link.hint}</Text> : null}
                            </Pressable>
                        </Fragment>
                    ))}
                </View>
            ) : null}

            {primaryLabel && onPrimary ? (
                <Pressable style={[styles.button, styles.primary]} onPress={onPrimary}>
                    <Text style={styles.primaryText}>{primaryLabel}</Text>
                </Pressable>
            ) : null}

            {secondaryLabel && onSecondary ? (
                <Pressable style={[styles.button, styles.secondary]} onPress={onSecondary}>
                    <Text style={styles.secondaryText}>{secondaryLabel}</Text>
                </Pressable>
            ) : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        padding: 24,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 999,
        backgroundColor: "#F3F4F6",
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
        color: "#6B7280",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        color: "#111827",
    },
    path: {
        fontSize: 12,
        fontFamily: "monospace",
        color: "#9CA3AF",
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: "center",
        color: "#4B5563",
        maxWidth: 320,
    },
    links: {
        alignSelf: "stretch",
        gap: 8,
        marginTop: 8,
    },
    linkRow: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: "#F9FAFB",
    },
    linkLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
    },
    linkHint: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 2,
    },
    button: {
        marginTop: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        minWidth: 220,
        alignItems: "center",
    },
    primary: {
        backgroundColor: "#C71585",
    },
    primaryText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    secondary: {
        backgroundColor: "transparent",
    },
    secondaryText: {
        color: "#6B7280",
        fontSize: 14,
        fontWeight: "500",
    },
});
