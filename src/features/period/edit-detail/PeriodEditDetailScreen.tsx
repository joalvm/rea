import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

import { DateWheel } from "@/components/date-wheel/DateWheel";
import { PrimaryButton } from "@/components/primary-button/PrimaryButton";
import { ToggleRow } from "@/components/toggle-row/ToggleRow";
import type { PeriodRun } from "@/db/schema/periodRun";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { usePeriodRunById } from "@/domain/hooks/usePeriodRunById";
import { getMonthLabels } from "@/modules/l10n/getMonthLabels";
import { type YMD, isoToYMD, todayYMD, ymdToISO } from "@/shared/utils/ymd";

import { usePeriodRunEditor } from "./hooks/usePeriodRunEditor";
import { usePeriodEditDetailStyles } from "./PeriodEditDetailStyle";

function PeriodEditDetailForm({ profileId, run }: { profileId: string; run: PeriodRun }) {
    const { t } = useTranslation("period");
    const styles = usePeriodEditDetailStyles();
    const monthLabels = getMonthLabels();
    const today = todayYMD();

    const [start, setStart] = useState<YMD>(isoToYMD(run.startDate));
    const [end, setEnd] = useState<YMD | null>(run.endDate ? isoToYMD(run.endDate) : null);
    const [excluded, setExcluded] = useState(run.status === "excluded");

    const { isSubmitting, save, confirmDelete } = usePeriodRunEditor(profileId, run);

    const handleSave = () =>
        save({
            startDate: ymdToISO(start),
            endDate: end ? ymdToISO(end) : null,
            excluded,
        });

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("edit.detail.title")}</Text>
            <Text style={styles.description}>{t("edit.detail.lead")}</Text>

            <Text style={styles.label}>{t("edit.detail.startLabel")}</Text>
            <DateWheel
                value={start}
                onChange={setStart}
                monthLabels={monthLabels}
                minYear={today.year - 5}
                maxYear={today.year}
                max={today}
                testID="period-edit-start"
            />

            {end ? (
                <>
                    <Text style={styles.label}>{t("edit.detail.endLabel")}</Text>
                    <DateWheel
                        value={end}
                        onChange={setEnd}
                        monthLabels={monthLabels}
                        minYear={today.year - 5}
                        maxYear={today.year}
                        max={today}
                        testID="period-edit-end"
                    />
                </>
            ) : (
                <Text style={styles.openHint}>{t("edit.list.statusOpen")}</Text>
            )}

            <View style={styles.divider} />

            <ToggleRow
                title={t("edit.detail.excludeTitle")}
                subtitle={t("edit.detail.excludeSubtitle")}
                value={excluded}
                onChange={setExcluded}
                testID="period-edit-excluded"
            />

            {excluded ? (
                <View style={styles.warning}>
                    <Text style={styles.warningText}>{t("edit.detail.excludeWarning")}</Text>
                </View>
            ) : null}

            <View style={styles.actions}>
                <PrimaryButton label={t("edit.detail.save")} onPress={handleSave} disabled={isSubmitting} />
            </View>
            <Pressable onPress={confirmDelete} style={styles.deleteLink} accessibilityRole="button">
                <Text style={styles.deleteLinkText}>{t("edit.detail.delete")}</Text>
            </Pressable>
        </ScrollView>
    );
}

/** Edición de una racha existente (plan 03, Fase 3): fechas + excluir + borrar. */
export default function PeriodEditDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const styles = usePeriodEditDetailStyles();
    const { profile } = useLocalProfile();
    const { run } = usePeriodRunById(id ?? "");

    if (!profile || !run) {
        return <View style={styles.screen} />;
    }

    return <PeriodEditDetailForm profileId={profile.id} run={run} />;
}
