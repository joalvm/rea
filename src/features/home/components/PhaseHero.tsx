import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
    FadeIn,
    interpolateColor,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTranslation } from "react-i18next";

import type { PhaseKey } from "@/theme/types/PhaseColors";
import { useTheme } from "@/theme/useTheme";
import { PHASE_ICONS } from "../utils/phaseIcons";
import { useHeroStyles } from "./PhaseHeroStyle";

type Props = {
    /** Fase estimada actual. Vendrá de `daily_summary.estimated_phase`. */
    phase: PhaseKey;
    /** Día del ciclo cuando el modo actual tiene una proyección de ciclo. */
    dayOfCycle?: number;
    /** Texto de confianza/estado (p. ej. "Confianza media"). */
    statusLabel?: string;
    /** CTA principal del Hero. */
    ctaLabel?: string;
    /** Identificador estable para automatización del CTA del feature dueño. */
    ctaTestID?: string;
    onPressCta?: () => void;
};

/**
 * Hero del Home que adapta fondo, textos y CTA a la fase del ciclo. Al cambiar de
 * fase el fondo transiciona suavemente (Reanimated) y el contenido reaparece con
 * un fade, para que la usuaria identifique su fase "por el color" apenas entra.
 *
 * Presentacional: recibe `phase` por props (el color lo da el tema y la copia el
 * feature). La fase real (motor de predicción) se conectará en `Home`.
 */
export function PhaseHero({ phase, dayOfCycle, statusLabel, ctaLabel, ctaTestID, onPressCta }: Props) {
    const { t } = useTranslation("home");
    const theme = useTheme();
    const styles = useHeroStyles();
    const insets = useSafeAreaInsets();
    const shouldReduceMotion = useReducedMotion();
    const visual = theme.phases[phase];
    const Icon = PHASE_ICONS[phase];
    const label = String(t(`phases.${phase}.label`));
    const caption = String(t(`phases.${phase}.caption`));
    const cta = ctaLabel ?? t("hero.cta");

    // Transición de color de fondo entre fases.
    const fromColor = useSharedValue(visual.surface);
    const toColor = useSharedValue(visual.surface);
    const progress = useSharedValue(1);

    useEffect(() => {
        fromColor.value = toColor.value;
        toColor.value = visual.surface;
        progress.value = 0;
        progress.value = withTiming(1, {
            duration: shouldReduceMotion ? 0 : theme.motion.duration.phase,
            easing: theme.motion.easing.standard,
        });
    }, [visual.surface, fromColor, toColor, progress, shouldReduceMotion, theme.motion]);

    const animatedBackground = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(progress.value, [0, 1], [fromColor.value, toColor.value]),
    }));

    return (
        <Animated.View style={[styles.hero, animatedBackground, { paddingTop: insets.top + theme.spacing.lg }]}>
            {/* Luces decorativas suaves (sin librería de degradado). */}
            <View
                pointerEvents="none"
                style={[styles.blob, styles.blobTop, { backgroundColor: visual.accentSubtle }]}
            />
            <View
                pointerEvents="none"
                style={[styles.blob, styles.blobBottom, { backgroundColor: visual.accentSubtle }]}
            />

            <Animated.View
                key={`${phase}-${theme.mode}`}
                entering={shouldReduceMotion ? undefined : FadeIn.duration(theme.motion.duration.phase)}
            >
                <View style={styles.headerRow}>
                    <View style={[styles.iconBubble, { backgroundColor: visual.elevatedSurface }]}>
                        <Icon size={22} color={visual.accent} strokeWidth={2} />
                    </View>
                    <Text style={[styles.overline, { color: visual.onSurfaceMuted }]}>{t("hero.overline")}</Text>
                </View>

                <Text style={[styles.label, { color: visual.onSurface }]}>{label}</Text>
                <Text style={[styles.caption, { color: visual.onSurfaceMuted }]}>{caption}</Text>

                <View style={styles.chipsRow}>
                    {typeof dayOfCycle === "number" ? (
                        <View style={[styles.chip, { backgroundColor: visual.elevatedSurface }]}>
                            <Text style={[styles.chipText, { color: visual.onElevatedSurface }]}>
                                {t("hero.cycleDay", { day: dayOfCycle })}
                            </Text>
                        </View>
                    ) : null}
                    {statusLabel ? (
                        <View style={[styles.chip, { backgroundColor: visual.elevatedSurface }]}>
                            <Text style={[styles.chipText, { color: visual.onElevatedSurface }]}>{statusLabel}</Text>
                        </View>
                    ) : null}
                </View>

                {onPressCta ? (
                    <Pressable
                        onPress={onPressCta}
                        accessibilityRole="button"
                        accessibilityLabel={cta}
                        testID={ctaTestID}
                        style={({ pressed }) => [
                            styles.cta,
                            { backgroundColor: visual.solid },
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={[styles.ctaText, { color: visual.onSolid }]}>{cta}</Text>
                    </Pressable>
                ) : null}
            </Animated.View>
        </Animated.View>
    );
}
