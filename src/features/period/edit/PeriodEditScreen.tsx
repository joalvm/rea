import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { PeriodRun } from "@/db/schema/periodRun";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { usePeriodRuns } from "@/domain/hooks/usePeriodRuns";
import { formatDate } from "@/modules/l10n/formatDate";
import { formatDateRange } from "@/modules/l10n/formatDateRange";

import { usePeriodEditStyles } from "./PeriodEditStyle";

const SOURCE_KEY = {
    user_confirmed: "edit.list.sourceConfirmed",
    bleeding_inferred: "edit.list.sourceInferred",
    mixed: "edit.list.sourceMixed",
} as const satisfies Record<PeriodRun["source"], string>;

function PeriodRunRow({ run, onPress }: { run: PeriodRun; onPress: () => void }) {
    const { t } = useTranslation("period");
    const styles = usePeriodEditStyles();

    const dateLabel =
        run.endDate === null
            ? t("edit.list.ongoingRange", { startDate: formatDate(run.startDate, "monthDay") })
            : formatDateRange(run.startDate, run.endDate);

    const badgeStyle =
        run.status === "open"
            ? styles.badgeOpen
            : run.status === "excluded"
              ? styles.badgeExcluded
              : styles.badgeClosed;
    const badgeTextStyle =
        run.status === "open"
            ? styles.badgeOpenText
            : run.status === "excluded"
              ? styles.badgeExcludedText
              : styles.badgeClosedText;
    const badgeLabel =
        run.status === "open"
            ? t("edit.list.statusOpen")
            : run.status === "excluded"
              ? t("edit.list.statusExcluded")
              : t("edit.list.statusClosed");

    return (
        <Pressable onPress={onPress} style={styles.row} accessibilityRole="button" accessibilityLabel={dateLabel}>
            <View>
                <Text style={styles.rowDate}>{dateLabel}</Text>
                <Text style={[styles.rowSource, run.status === "excluded" && styles.rowSourceExcluded]}>
                    {run.status === "excluded" ? t("edit.list.excludedHint") : t(SOURCE_KEY[run.source])}
                </Text>
            </View>
            <View style={[styles.badge, badgeStyle]}>
                <Text style={[styles.badgeText, badgeTextStyle]}>{badgeLabel}</Text>
            </View>
        </Pressable>
    );
}

/** Historial de rachas de periodo (plan 03, Fase 3): lista de `period_runs`, cada una editable. */
export default function PeriodEditScreen() {
    const { t } = useTranslation("period");
    const styles = usePeriodEditStyles();
    const router = useRouter();
    const { profile } = useLocalProfile();
    const { runs } = usePeriodRuns(profile?.id ?? "");

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("edit.list.title")}</Text>
            <Text style={styles.description}>{t("edit.list.lead")}</Text>

            {runs.length === 0 ? (
                <Text style={styles.emptyText}>{t("edit.list.empty")}</Text>
            ) : (
                <View style={styles.list}>
                    {runs.map((run) => (
                        <PeriodRunRow
                            key={run.id}
                            run={run}
                            onPress={() => router.push({ pathname: "/period/edit/[id]", params: { id: run.id } })}
                        />
                    ))}
                </View>
            )}
        </ScrollView>
    );
}
