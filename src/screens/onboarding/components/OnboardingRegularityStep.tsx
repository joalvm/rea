import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { colors } from "@/theme";
import { Regularity } from "@/types/settings.types";
import { StepShell } from "@/ui/StepShell";
import styles from "../OnboardingScreen.styles";
import { REGULARITY } from "../constants/onboardingOptions";

interface OnboardingRegularityStepProps {
    hormonalContraception: boolean;
    onChangeRegularity: (value: Regularity) => void;
    onToggleHormonalContraception: () => void;
    regularity: Regularity;
}

/** Configura regularidad percibida y anticoncepción hormonal. */
export default function OnboardingRegularityStep({
    hormonalContraception,
    onChangeRegularity,
    onToggleHormonalContraception,
    regularity,
}: OnboardingRegularityStepProps) {
    const { t } = useTranslation("onboarding");

    return (
        <StepShell icon="chart-timeline-variant" subtitle={t("regularity.subtitle")} title={t("regularity.title")}>
            <View style={styles.segmentGroup}>
                {REGULARITY.map((item) => (
                    <Pressable
                        key={item.key}
                        onPress={() => onChangeRegularity(item.key)}
                        style={[styles.segment, regularity === item.key && styles.segmentActive]}
                    >
                        <Text style={[styles.segmentText, regularity === item.key && styles.segmentTextActive]}>
                            {item.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
            <Pressable
                onPress={onToggleHormonalContraception}
                style={[styles.toggleRow, hormonalContraception && styles.toggleRowActive]}
            >
                <Text style={styles.toggleText}>{t("regularity.hormonalContraception")}</Text>
                <MaterialCommunityIcons
                    color={hormonalContraception ? colors.primaryDeep : colors.muted}
                    name={hormonalContraception ? "check-circle" : "circle-outline"}
                    size={24}
                />
            </Pressable>
        </StepShell>
    );
}
