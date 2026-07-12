import type { LucideIcon } from "lucide-react-native";
import { Leaf, ListChecks, Waves } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button/PrimaryButton";
import { SelectableCard } from "@/components/selectable-card/SelectableCard";
import { useTheme } from "@/theme/useTheme";
import { CheckinScreen } from "@/features/checkin/shared/components/checkin-screen/CheckinScreen";
import { useCheckinScreenStyles } from "@/features/checkin/shared/components/checkin-screen/CheckinScreenStyle";
import { useCheckinIntroStyles } from "./CheckinIntroStyle";

import { useCheckinStore } from "../shared/stores/useCheckinStore";

type IntroMode = "quick" | "complete" | "nothing";

type ModeOption = {
    key: IntroMode;
    Icon: LucideIcon;
    titleKey: "intro.quick" | "intro.complete" | "intro.nothingToReport";
    hintKey: "intro.quickHint" | "intro.completeHint" | "intro.nothingHint";
};

const MODE_OPTIONS: readonly ModeOption[] = [
    { key: "quick", Icon: Leaf, titleKey: "intro.quick", hintKey: "intro.quickHint" },
    { key: "complete", Icon: ListChecks, titleKey: "intro.complete", hintKey: "intro.completeHint" },
    { key: "nothing", Icon: Waves, titleKey: "intro.nothingToReport", hintKey: "intro.nothingHint" },
];

type Props = {
    onStart: () => void;
};

/**
 * Check-in (entrada): elige cómo registrar este momento — esencial, completo o
 * nada que reportar. Cada modo es un `SelectableCard` (icono + título +
 * descripción guía). El CTA "Empezar" se habilita al elegir.
 */
export default function CheckinIntroScreen({ onStart }: Props) {
    const { t } = useTranslation("checkIn");
    const { t: tCommon } = useTranslation("common");
    const theme = useTheme();
    const styles = useCheckinIntroStyles();
    const screenStyles = useCheckinScreenStyles();
    const reset = useCheckinStore((state) => state.reset);
    const [mode, setMode] = useState<IntroMode | null>(null);

    const start = () => {
        // "Nada que reportar" no lleva al wizard: limpia y arranca directo en la
        // revisión para un guardado vacío explícito.
        reset();
        onStart();
    };

    return (
        <CheckinScreen>
            <View style={styles.heroWrap}>
                <View style={styles.heroBlob}>
                    <Waves size={theme.sizing.iconXl} color={theme.colors.primary} strokeWidth={2.2} />
                </View>
                <Text style={styles.title}>{t("intro.title")}</Text>
                <Text style={styles.lead}>{t("intro.lead")}</Text>
            </View>

            <View style={styles.options}>
                {MODE_OPTIONS.map((option) => (
                    <SelectableCard
                        key={option.key}
                        Icon={option.Icon}
                        title={t(option.titleKey)}
                        subtitle={t(option.hintKey)}
                        selected={mode === option.key}
                        onPress={() => setMode(option.key)}
                        testID={`checkin-mode-${option.key}`}
                    />
                ))}
            </View>

            <View style={screenStyles.footer}>
                <PrimaryButton
                    label={tCommon("action.start")}
                    onPress={start}
                    disabled={mode === null}
                />
            </View>
        </CheckinScreen>
    );
}
