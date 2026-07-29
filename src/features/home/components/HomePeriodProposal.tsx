import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { PeriodProposal } from "@/domain/hooks/usePeriodProposal";

import { useHomeStyles } from "../HomeStyle";

type Props = {
    proposal: PeriodProposal;
    onPress: () => void;
};

/** Aviso de una propuesta de periodo; nunca aplica la reconciliación por sí solo. */
export function HomePeriodProposal({ proposal, onPress }: Props) {
    const { t } = useTranslation("home");
    const styles = useHomeStyles();

    if (proposal.action.type === "nada") return null;

    return (
        <View style={styles.proposalCard}>
            <Text style={styles.cardTitle}>{t("proposal.title")}</Text>
            <Text style={styles.cardText}>{t("proposal.body")}</Text>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("proposal.action")}
                onPress={onPress}
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            >
                <Text style={styles.secondaryBtnText}>{t("proposal.action")}</Text>
            </Pressable>
        </View>
    );
}
