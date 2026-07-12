import { inArray } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Sparkles } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import type { ReproductiveMode, ReproductiveModeFilter } from "@/db/enums/reproductiveMode";
import { symptomCatalog } from "@/db/schema/symptomCatalog";
import type { SymptomCatalog } from "@/db/schema/symptomCatalog";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { useActiveIntent } from "@/domain/hooks/useActiveIntent";
import { useDatabase } from "@/db/useDatabase";
import { CheckinHeader } from "@/features/checkin/shared/components/checkin-screen/CheckinHeader";
import { CheckinScreen } from "@/features/checkin/shared/components/checkin-screen/CheckinScreen";
import { SectionTitle } from "@/features/checkin/shared/components/checkin-screen/SectionTitle";
import { useCheckinScreenStyles } from "@/features/checkin/shared/components/checkin-screen/CheckinScreenStyle";
import { useSymptomsStyles } from "./SymptomsStyle";
import { MultiChip } from "@/features/checkin/shared/components/multi-chip/MultiChip";
import { PrimaryButton } from "@/components/primary-button/PrimaryButton";

import { useCheckinStore } from "../shared/stores/useCheckinStore";

type TFunc = ReturnType<typeof useTranslation>["t"];

/** Traduce un `labelKey` del catálogo (formato `namespace:resto`) a texto. */
function resolveLabel(labelKey: string, t: TFunc): string {
    const [ns, ...rest] = labelKey.split(":");
    if (!ns || rest.length === 0) {
        return labelKey;
    }
    return String(t(rest.join(":"), { ns } as never));
}

type Props = {
    onContinue: () => void;
};

/** Check-in paso 4: síntomas del catálogo con intensidad (multiselección). */
export default function SymptomsScreen({ onContinue }: Props) {
    const { t } = useTranslation();
    const { t: tCheckin } = useTranslation("checkIn");
    const { t: tCommon } = useTranslation("common");
    const styles = useSymptomsStyles();
    const screenStyles = useCheckinScreenStyles();
    const database = useDatabase();
    const { profile } = useLocalProfile();
    const { intent } = useActiveIntent(profile?.id ?? "");
    const draftSymptoms = useCheckinStore((state) => state.draft.symptoms);
    const toggleSymptom = useCheckinStore((state) => state.toggleSymptom);
    const setSymptomIntensity = useCheckinStore((state) => state.setSymptomIntensity);

    const mode = intent?.reproductiveMode as ReproductiveMode | undefined;
    // Síntomas que aplican a todos o al modo activo. Sin modo conocido, solo "all".
    const applicableModes: ReproductiveModeFilter[] = mode ? [mode, "all"] : ["all"];
    const { data: symptoms } = useLiveQuery(
        database
            .select()
            .from(symptomCatalog)
            .where(inArray(symptomCatalog.applicableMode, applicableModes))
            .orderBy(symptomCatalog.uiPriority, symptomCatalog.symptomKey),
        [mode],
    );

    // Agrupa por groupKey preservando el orden de prioridad.
    const activeSymptoms = (symptoms ?? []).filter((s) => s.isActive);
    const groups = new Map<string, SymptomCatalog[]>();
    for (const s of activeSymptoms) {
        const list = groups.get(s.groupKey) ?? [];
        list.push(s);
        groups.set(s.groupKey, list);
    }

    const isOn = (key: string) => draftSymptoms.some((s) => s.symptomKey === key);
    const intensityOf = (key: string) => draftSymptoms.find((s) => s.symptomKey === key)?.intensity ?? 0;

    return (
        <CheckinScreen>
            <CheckinHeader Icon={Sparkles} title={tCheckin("symptomStep.title")} lead={tCheckin("symptomStep.hint")} />

            {activeSymptoms.length === 0 ? (
                <Text style={styles.empty}>{tCheckin("symptomStep.empty")}</Text>
            ) : (
                Array.from(groups.entries()).map(([groupKey, items]) => (
                    <View key={groupKey} style={styles.group}>
                        <SectionTitle>{tCheckin(`symptomGroups.${groupKey}` as never)}</SectionTitle>
                        <View style={styles.chipsWrap}>
                            {items.map((symptom) => {
                                const on = isOn(symptom.symptomKey);
                                return (
                                    <MultiChip
                                        key={symptom.symptomKey}
                                        label={resolveLabel(symptom.labelKey, t)}
                                        selected={on}
                                        level={on ? intensityOf(symptom.symptomKey) : undefined}
                                        onPress={() => toggleSymptom(symptom.symptomKey)}
                                    />
                                );
                            })}
                        </View>
                        {items.some((s) => isOn(s.symptomKey)) ? (
                            <View style={styles.intensityWrap}>
                                {items
                                    .filter((s) => isOn(s.symptomKey))
                                    .map((symptom) => (
                                        <View key={symptom.symptomKey} style={styles.intensityRow}>
                                            <Text style={styles.intensityLabel}>
                                                {resolveLabel(symptom.labelKey, t)}
                                            </Text>
                                            <View style={styles.intensityDots}>
                                                {[1, 2, 3, 4, 5].map((level) => {
                                                    const active = intensityOf(symptom.symptomKey) >= level;
                                                    return (
                                                        <Text
                                                            key={level}
                                                            onPress={() =>
                                                                setSymptomIntensity(symptom.symptomKey, level)
                                                            }
                                                            style={[
                                                                styles.intensityDot,
                                                                active && styles.intensityDotOn,
                                                            ]}
                                                        >
                                                            {"●"}
                                                        </Text>
                                                    );
                                                })}
                                            </View>
                                        </View>
                                    ))}
                            </View>
                        ) : null}
                    </View>
                ))
            )}

            <View style={screenStyles.footer}>
                <PrimaryButton label={tCommon("action.continue")} onPress={onContinue} />
            </View>
        </CheckinScreen>
    );
}
