import { Fragment } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ChevronRightIcon } from "lucide-react-native";

import { useTheme } from "@/theme/useTheme";
import { usePlaceholderStyles } from "./PlaceholderStyle";

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
 * Placeholder compartido por las pantallas aún sin diseño. Ya consume el tema
 * (colores, tipografía, espaciado, sombras) para que las pantallas pendientes se
 * vean cuidadas y respondan a claro/oscuro mientras se aterriza su UI real.
 */
export default function Placeholder({
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
    const theme = useTheme();
    const styles = usePlaceholderStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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
                            <Pressable
                                style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
                                onPress={link.onPress}
                            >
                                <View style={styles.linkText}>
                                    <Text style={styles.linkLabel}>{link.label}</Text>
                                    {link.hint ? <Text style={styles.linkHint}>{link.hint}</Text> : null}
                                </View>
                                <ChevronRightIcon size={20} color={theme.colors.icon} strokeWidth={2} />
                            </Pressable>
                        </Fragment>
                    ))}
                </View>
            ) : null}

            {primaryLabel && onPrimary ? (
                <Pressable
                    style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                    onPress={onPrimary}
                >
                    <Text style={styles.primaryText}>{primaryLabel}</Text>
                </Pressable>
            ) : null}

            {secondaryLabel && onSecondary ? (
                <Pressable
                    style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
                    onPress={onSecondary}
                >
                    <Text style={styles.secondaryText}>{secondaryLabel}</Text>
                </Pressable>
            ) : null}
        </ScrollView>
    );
}
