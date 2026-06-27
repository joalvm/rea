import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useTranslation } from "react-i18next";

import { createStyles } from "@/theme/createStyles";
import { PHASE_KEYS, type PhaseKey } from "@/theme/types/PhaseColors";
import { useTheme } from "@/theme/useTheme";
import { PhaseHero } from "./components/PhaseHero";

type Props = {
    onStartCheckin: () => void;
    onOpenDiary: () => void;
};

/**
 * Tab Inicio (Home). Muestra el Hero adaptativo por fase + un cuerpo con el
 * resumen del día (aún placeholder) y el acceso al diario.
 *
 * NOTA: el selector de fases de abajo es TEMPORAL — sirve para previsualizar el
 * theming por fase en Expo Go. Se reemplazará por la fase real de
 * `daily_summary.estimated_phase` cuando exista el motor de predicción.
 */
export default function TodayScreen({ onStartCheckin, onOpenDiary }: Props) {
    const { t } = useTranslation("preview");
    const theme = useTheme();
    const styles = useTodayStyles();
    const [phase, setPhase] = useState<PhaseKey>("follicular");

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <PhaseHero phase={phase} dayOfCycle={12} statusLabel={t("hero.statusMedium")} onPressCta={onStartCheckin} />

            <View style={styles.body}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t("summary.title")}</Text>
                    <Text style={styles.cardText}>{t("summary.body")}</Text>
                </View>

                <Pressable
                    onPress={onOpenDiary}
                    accessibilityRole="button"
                    accessibilityLabel={t("summary.openDiary")}
                    style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                >
                    <Text style={styles.secondaryBtnText}>{t("summary.openDiary")}</Text>
                </Pressable>

                {/* ── Vista previa temporal del theming por fase (quitar al integrar predicción) ── */}
                <View style={styles.previewBlock}>
                    <Text style={styles.previewLabel}>{t("summary.phasePreview")}</Text>
                    <View style={styles.previewChips}>
                        {PHASE_KEYS.map((key) => {
                            const active = key === phase;
                            const phaseColors = theme.phases[key];
                            return (
                                <Pressable
                                    key={key}
                                    onPress={() => setPhase(key)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: active }}
                                    accessibilityLabel={t(`phases.${key}.label`)}
                                    style={[
                                        styles.previewChip,
                                        active && {
                                            backgroundColor: phaseColors.surface,
                                            borderColor: phaseColors.accent,
                                        },
                                    ]}
                                >
                                    <Text style={[styles.previewChipText, active && { color: phaseColors.onSurface }]}>
                                        {t(`phases.${key}.label`)}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const useTodayStyles = createStyles((theme) => {
    const { colors, spacing, radius, typography, shadows, borderWidth, sizing } = theme;

    return {
        screen: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            paddingBottom: spacing["5xl"],
        },
        body: {
            paddingHorizontal: spacing["2xl"],
            gap: spacing.lg,
            marginTop: spacing.xl,
        },
        card: {
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            padding: spacing.xl,
            gap: spacing.sm,
            ...shadows[1],
        },
        cardTitle: {
            ...typography.variant.h3,
            color: colors.text,
        },
        cardText: {
            ...typography.variant.callout,
            color: colors.textSecondary,
        },
        secondaryBtn: {
            minHeight: sizing.controlMd,
            borderRadius: radius.pill,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
        },
        secondaryBtnText: {
            ...typography.variant.bodyStrong,
            color: colors.link,
        },
        previewBlock: {
            marginTop: spacing.sm,
            gap: spacing.sm,
        },
        previewLabel: {
            ...typography.variant.overline,
            color: colors.textMuted,
        },
        previewChips: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
        },
        previewChip: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radius.pill,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            backgroundColor: colors.surfaceAlt,
        },
        previewChipText: {
            ...typography.variant.subhead,
            color: colors.textSecondary,
        },
        pressed: {
            opacity: 0.85,
        },
    };
});
