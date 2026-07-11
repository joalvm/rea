import type { LucideIcon } from "lucide-react-native";
import { Leaf, ListChecks, Waves } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button/PrimaryButton";
import { useTheme } from "@/theme/useTheme";
import { CheckinScreen } from "@/features/checkin/shared/components/checkin-screen/CheckinScreen";
import { useCheckinIntroStyles } from "./CheckinIntroStyle";

import { useCheckinStore } from "../shared/stores/useCheckinStore";

type IntroMode = "quick" | "complete" | "nothing";

type ModeOption = {
    key: IntroMode;
    Icon: LucideIcon;
    titleKey: "intro.quick" | "intro.complete" | "intro.nothingToReport";
};

const MODE_OPTIONS: readonly ModeOption[] = [
    { key: "quick", Icon: Leaf, titleKey: "intro.quick" },
    { key: "complete", Icon: ListChecks, titleKey: "intro.complete" },
    { key: "nothing", Icon: Waves, titleKey: "intro.nothingToReport" },
];

type Props = {
    onStart: () => void;
};

/** Check-in (entrada): elige modo rápido, completo o "nada que reportar". */
export default function CheckinIntroScreen({ onStart }: Props) {
    const { t } = useTranslation("checkIn");
    const { t: tCommon } = useTranslation("common");
    const theme = useTheme();
    const styles = useCheckinIntroStyles();
    const reset = useCheckinStore((state) => state.reset);
    const [mode, setMode] = useState<IntroMode | null>(null);

    const start = () => {
        // "Nada que reportar" no lleva al wizard: limpia y arranca directo en la
        // revisión para un guardado vacío explícito.
        reset();
        onStart();
    };

    return (
        <CheckinScreen
            cta={{
                label: tCommon("action.start"),
                onPress: start,
                disabled: mode === null,
            }}
        >
            <View style={styles.heroWrap}>
                <View style={styles.heroBlob}>
                    <Waves size={theme.sizing.iconXl} color={theme.colors.primary} strokeWidth={2.2} />
                </View>
                <Text style={styles.title}>{t("intro.title")}</Text>
                <Text style={styles.lead}>{t("intro.lead")}</Text>
            </View>

            <View style={styles.options}>
                {MODE_OPTIONS.map((option) => {
                    const selected = mode === option.key;
                    return (
                        <PrimaryButton
                            key={option.key}
                            label={t(option.titleKey)}
                            onPress={() => setMode(option.key)}
                            variant={selected ? "primary" : "secondary"}
                            Icon={option.Icon}
                        />
                    );
                })}
            </View>
        </CheckinScreen>
    );
}
