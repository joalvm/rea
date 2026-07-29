import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { useDatabase } from "@/db/useDatabase";
import { useActiveIntent } from "@/domain/hooks/useActiveIntent";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { transitionCycleMode, type CycleMode } from "@/domain/reproductive/transitionCycleMode";
import { formatDate } from "@/modules/l10n/formatDate";
import { todayYMD, ymdToISO } from "@/shared/utils/ymd";
import { useCycleProfileStyles } from "./CycleProfileStyle";

const CYCLE_MODES: CycleMode[] = ["tracking_only", "tracking_avoid_pregnancy", "tracking_ttc"];

/** Contexto reproductivo vigente; la escritura de una nueva intención queda versionada. */
export default function CycleProfileScreen() {
    const { t } = useTranslation("settings");
    const styles = useCycleProfileStyles();
    const database = useDatabase();
    const { profile } = useLocalProfile();
    const { intent } = useActiveIntent(profile?.id ?? "");

    const handleModeChange = (targetMode: CycleMode) => {
        if (!profile || !intent || intent.reproductiveMode === targetMode) return;
        Alert.alert(t("changeModeTitle"), t("changeModeBody"), [
            { text: t("cancel"), style: "cancel" },
            {
                text: t(`mode.${targetMode}` as never),
                onPress: () => {
                    void transitionCycleMode(database, {
                        profileId: profile.id,
                        effectiveFrom: ymdToISO(todayYMD()),
                        targetMode,
                        regularity: intent.regularity ?? "regular",
                        declaredCycleLength: intent.declaredCycleLength ?? 28,
                        declaredPeriodLength: intent.declaredPeriodLength ?? 5,
                        contraceptionMethod: intent.contraceptionMethod,
                    }).catch(() => Alert.alert(t("error")));
                },
            },
        ]);
    };

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("profileTitle")}</Text>
            <Text style={styles.description}>{t("profileDescription")}</Text>
            {intent ? (
                <View style={styles.links}>
                    <View style={styles.linkRow}>
                        <Text style={styles.linkLabel}>{t("mode")}</Text>
                        <Text style={styles.linkHint}>{t(`mode.${intent.reproductiveMode}` as never)}</Text>
                        <Text style={styles.linkHint}>
                            {t("versionFrom", { date: formatDate(intent.effectiveFrom, "long") })}
                        </Text>
                    </View>
                    {intent.regularity ? (
                        <Text style={styles.linkHint}>
                            {t("regularity")}: {intent.regularity}
                        </Text>
                    ) : null}
                    {intent.declaredCycleLength ? (
                        <Text style={styles.linkHint}>{t("cycleLength", { value: intent.declaredCycleLength })}</Text>
                    ) : null}
                    {intent.declaredPeriodLength ? (
                        <Text style={styles.linkHint}>{t("periodLength", { value: intent.declaredPeriodLength })}</Text>
                    ) : null}
                    {intent.contraceptionMethod ? (
                        <Text style={styles.linkHint}>{t("contraception", { value: intent.contraceptionMethod })}</Text>
                    ) : null}
                    {intent.reproductiveMode !== "pregnancy_tracking"
                        ? CYCLE_MODES.map((mode) => (
                              <Pressable
                                  key={mode}
                                  accessibilityRole="button"
                                  onPress={() => handleModeChange(mode)}
                                  style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
                              >
                                  <Text style={styles.secondaryText}>{t(`mode.${mode}` as never)}</Text>
                              </Pressable>
                          ))
                        : null}
                </View>
            ) : (
                <Text style={styles.description}>{t("emptyProfile")}</Text>
            )}
        </ScrollView>
    );
}
