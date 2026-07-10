import { CalendarCheck, Droplet, GitMerge } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button/PrimaryButton";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { usePeriodProposal } from "@/domain/hooks/usePeriodProposal";
import { formatDate } from "@/modules/l10n/formatDate";
import { useTheme } from "@/theme/useTheme";

import { useConfirmPeriodProposal } from "./hooks/useConfirmPeriodProposal";
import { usePeriodConfirmStyles } from "./PeriodConfirmStyle";

/** Pantalla de confirmación para las propuestas de `reconcilePeriodState` (plan 03, Fase 2). */
export default function PeriodConfirmScreen() {
    const { t } = useTranslation("period");
    const theme = useTheme();
    const styles = usePeriodConfirmStyles();
    const { profile } = useLocalProfile();
    const proposal = usePeriodProposal(profile?.id ?? "");
    const actions = useConfirmPeriodProposal(profile?.id ?? "", proposal);

    if (!profile) {
        return <View style={styles.screen} />;
    }

    const { action } = proposal;

    if (action.type === "nada") {
        return (
            <ScrollView
                style={styles.screen}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>{t("confirm.empty.title")}</Text>
                <Text style={styles.description}>{t("confirm.empty.lead")}</Text>
                <View style={styles.actions}>
                    <PrimaryButton label={t("confirm.empty.back")} onPress={actions.dismiss} variant="secondary" />
                </View>
            </ScrollView>
        );
    }

    if (action.type === "proponer_inicio") {
        return (
            <ScrollView
                style={styles.screen}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.iconWrap}>
                    <Droplet size={40} color={theme.colors.link} strokeWidth={1.9} />
                </View>
                <Text style={styles.title}>
                    {t("confirm.start.title", { date: formatDate(action.startDate, "monthDay") })}
                </Text>
                <Text style={styles.description}>{t("confirm.start.lead")}</Text>
                <View style={styles.note}>
                    <Text style={styles.noteText}>
                        {t("confirm.start.evidence", { range: formatDate(action.startDate, "monthDay") })}
                    </Text>
                </View>
                <View style={styles.actions}>
                    <PrimaryButton
                        label={t("confirm.start.confirm")}
                        onPress={() => actions.confirmStart(action.startDate)}
                    />
                    <PrimaryButton
                        label={t("confirm.start.spotting")}
                        variant="ghost"
                        onPress={() => actions.markSpotting(action.startDate)}
                    />
                </View>
                <View style={styles.dismiss}>
                    <PrimaryButton label={t("confirm.start.dismiss")} variant="secondary" onPress={actions.dismiss} />
                </View>
            </ScrollView>
        );
    }

    if (action.type === "proponer_cierre") {
        return (
            <ScrollView
                style={styles.screen}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.iconWrap}>
                    <CalendarCheck size={40} color={theme.colors.link} strokeWidth={1.9} />
                </View>
                <Text style={styles.title}>{t("confirm.close.title")}</Text>
                <Text style={styles.description}>
                    {t("confirm.close.lead", { date: formatDate(action.endDate, "monthDay") })}
                </Text>
                <View style={styles.note}>
                    <Text style={styles.noteText}>{t("confirm.close.hint")}</Text>
                </View>
                <View style={styles.actions}>
                    <PrimaryButton
                        label={t("confirm.close.confirm", { date: formatDate(action.endDate, "monthDay") })}
                        onPress={() => actions.confirmClose(action.endDate)}
                    />
                    <PrimaryButton label={t("confirm.close.dismiss")} variant="ghost" onPress={actions.dismiss} />
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.iconWrap}>
                <GitMerge size={40} color={theme.colors.link} strokeWidth={1.9} />
            </View>
            <Text style={styles.title}>{t("confirm.merge.title")}</Text>
            <Text style={styles.description}>
                {t("confirm.merge.lead", {
                    previousEndDate: formatDate(action.closedRunEndDate, "monthDay"),
                    newStartDate: formatDate(action.newStartDate, "monthDay"),
                    gapDays: action.gapDays,
                })}
            </Text>
            <View style={styles.note}>
                <Text style={styles.noteText}>{t("confirm.merge.hint")}</Text>
            </View>
            <View style={styles.actions}>
                <PrimaryButton label={t("confirm.merge.confirm")} onPress={actions.confirmMerge} />
                <PrimaryButton
                    label={t("confirm.merge.dismiss")}
                    variant="ghost"
                    onPress={() => actions.declineMerge(action.newStartDate)}
                />
            </View>
        </ScrollView>
    );
}
