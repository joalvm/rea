import type { LucideIcon } from "lucide-react-native";
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/theme/useTheme";

import { PrimaryButton } from "../primary-button/PrimaryButton";
import { ProgressIndicator } from "../progress-indicator/ProgressIndicator";
import { useOnboardingScreenStyles } from "./OnboardingScreenStyle";

export type OnboardingCta = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    Icon?: LucideIcon;
};

type Props = {
    progress?: number;
    step?: number;
    total?: number;
    onBack?: () => void;
    accent?: string;
    cta?: OnboardingCta;
    secondaryCta?: OnboardingCta;
    footer?: ReactNode;
    center?: boolean;
    children: ReactNode;
};

export function OnboardingScreen({
    progress,
    step,
    total,
    onBack,
    accent,
    cta,
    secondaryCta,
    footer,
    center,
    children,
}: Props) {
    const { t } = useTranslation("onboarding");
    const theme = useTheme();
    const styles = useOnboardingScreenStyles();

    return (
        <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
            {typeof progress === "number" ? (
                <View style={styles.progressWrap}>
                    <ProgressIndicator progress={progress} accent={accent} />
                </View>
            ) : null}

            {onBack || step ? (
                <View style={styles.header}>
                    <View>
                        {onBack ? (
                            <Pressable
                                onPress={onBack}
                                accessibilityRole="button"
                                accessibilityLabel={t("back")}
                                style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
                            >
                                <ChevronLeft size={20} color={theme.colors.textSecondary} strokeWidth={2.4} />
                            </Pressable>
                        ) : null}
                    </View>
                    {step ? <Text style={styles.step}>{total ? `${step} / ${total}` : step}</Text> : null}
                </View>
            ) : null}

            <ScrollView
                contentContainerStyle={[styles.bodyContent, center && styles.bodyCenter]}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>

            {footer ? (
                <>
                    <View style={styles.divider} />
                    <View style={styles.footer}>{footer}</View>
                </>
            ) : null}
            {!footer && (cta || secondaryCta) ? (
                <>
                    <View style={styles.divider} />
                    <View style={styles.footer}>
                        {cta ? (
                            <PrimaryButton
                                label={cta.label}
                                onPress={cta.onPress}
                                disabled={cta.disabled}
                                accent={accent}
                                Icon={cta.Icon}
                            />
                        ) : null}
                        {secondaryCta ? (
                            <PrimaryButton
                                label={secondaryCta.label}
                                onPress={secondaryCta.onPress}
                                disabled={secondaryCta.disabled}
                                variant="secondary"
                            />
                        ) : null}
                    </View>
                </>
            ) : null}
        </SafeAreaView>
    );
}
