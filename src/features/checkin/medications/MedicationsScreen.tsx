import { eq, isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import type { LucideIcon } from "lucide-react-native";
import { Frown, Meh, Pill, Plus, Smile, X } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View } from "react-native";

import type { Database } from "@/db/client";
import { medicationCatalog } from "@/db/schema/medicationCatalog";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { useDatabase } from "@/db/useDatabase";
import { useTheme } from "@/theme/useTheme";
import { CheckinHeader } from "@/features/checkin/shared/components/checkin-screen/CheckinHeader";
import { CheckinScreen } from "@/features/checkin/shared/components/checkin-screen/CheckinScreen";
import { CheckinSaveButton } from "@/features/checkin/shared/components/checkin-screen/CheckinSaveButton";
import { SectionTitle } from "@/features/checkin/shared/components/checkin-screen/SectionTitle";
import { useCheckinScreenStyles } from "@/features/checkin/shared/components/checkin-screen/CheckinScreenStyle";
import { ChoiceCard } from "@/features/checkin/shared/components/choice-card/ChoiceCard";
import { ChoiceGrid } from "@/features/checkin/shared/components/choice-card/ChoiceGrid";
import { useCheckinStepMetric } from "@/features/checkin/shared/dev/useCheckinStepMetric";
import { useMedicationsStyles } from "./MedicationsStyle";
import { PrimaryButton } from "@/components/primary-button/PrimaryButton";

import type { DraftMedication } from "../shared/types/CheckinDraft";
import { useCheckinStore } from "../shared/stores/useCheckinStore";

type ReliefOption = {
    value: number;
    Icon: LucideIcon;
    labelKey: "medications.relief.0" | "medications.relief.1" | "medications.relief.2";
};

const RELIEF_OPTIONS: readonly ReliefOption[] = [
    { value: 0, Icon: Frown, labelKey: "medications.relief.0" },
    { value: 1, Icon: Meh, labelKey: "medications.relief.1" },
    { value: 2, Icon: Smile, labelKey: "medications.relief.2" },
];

type Props = {
    onContinue: () => void;
    onSaved: () => void;
};

/** Check-in paso 6: medicamentos tomados (catálogo personal + alta manual). */
export default function MedicationsScreen({ onContinue, onSaved }: Props) {
    const { t: tCheckin } = useTranslation("checkIn");
    const { t: tCommon } = useTranslation("common");
    useCheckinStepMetric("medications");
    const theme = useTheme();
    const styles = useMedicationsStyles();
    const screenStyles = useCheckinScreenStyles();
    const database = useDatabase();
    const { profile } = useLocalProfile();
    const medications = useCheckinStore((state) => state.draft.medications);
    const upsertMedication = useCheckinStore((state) => state.upsertMedication);
    const removeMedication = useCheckinStore((state) => state.removeMedication);

    const [draftName, setDraftName] = useState("");

    const profileId = profile?.id ?? "";
    const { data: catalog } = useLiveQuery(
        (database as Database)
            .select()
            .from(medicationCatalog)
            .where(profileId ? eq(medicationCatalog.profileId, profileId) : isNull(medicationCatalog.id)),
        [profileId],
    );

    const addManual = () => {
        const name = draftName.trim();
        if (!name) {
            return;
        }
        upsertMedication({ name });
        setDraftName("");
    };

    const toggleCatalog = (id: string, name: string) => {
        const exists = medications.find((m) => m.medicationId === id);
        if (exists) {
            removeMedication({ medicationId: id });
        } else {
            upsertMedication({ medicationId: id, name });
        }
    };

    const isCatalogOn = (id: string) => medications.some((m) => m.medicationId === id);
    const reliefOf = (key: string) => medications.find((m) => (m.medicationId ?? m.name) === key)?.relief;

    const renderMed = (med: DraftMedication) => {
        const key = med.medicationId ?? med.name ?? "";
        const currentRelief = reliefOf(key);
        const identity = med.medicationId ? { medicationId: med.medicationId } : { name: med.name };
        return (
            <View key={key} style={styles.medCard}>
                <View style={styles.medHead}>
                    <View style={styles.medNameWrap}>
                        <Pill size={theme.sizing.iconSm} color={theme.colors.link} strokeWidth={2.2} />
                        <Text style={styles.medName}>{med.name ?? key}</Text>
                    </View>
                    <Pressable
                        onPress={() => removeMedication(identity)}
                        accessibilityLabel={tCommon("action.back")}
                        hitSlop={8}
                    >
                        <X size={18} color={theme.colors.textMuted} strokeWidth={2.2} />
                    </Pressable>
                </View>

                <TextInput
                    style={styles.doseInput}
                    value={med.doseNote ?? ""}
                    onChangeText={(text) => upsertMedication({ ...identity, doseNote: text })}
                    placeholder={tCheckin("medications.dosePlaceholder")}
                    placeholderTextColor={theme.colors.placeholder}
                />

                <ChoiceGrid>
                    {RELIEF_OPTIONS.map((option) => (
                        <ChoiceCard
                            key={option.value}
                            Icon={option.Icon}
                            label={tCheckin(option.labelKey)}
                            selected={currentRelief === option.value}
                            onPress={() =>
                                upsertMedication({
                                    ...identity,
                                    relief: currentRelief === option.value ? undefined : option.value,
                                })
                            }
                        />
                    ))}
                </ChoiceGrid>
            </View>
        );
    };

    return (
        <CheckinScreen>
            <CheckinHeader Icon={Pill} title={tCheckin("medications.title")} lead={tCheckin("medications.hint")} />

            {/* Alta manual */}
            <SectionTitle>{tCheckin("medications.add")}</SectionTitle>
            <View style={styles.addRow}>
                <TextInput
                    style={styles.nameInput}
                    value={draftName}
                    onChangeText={setDraftName}
                    placeholder={tCheckin("medications.placeholder")}
                    placeholderTextColor={theme.colors.placeholder}
                />
                <Pressable
                    onPress={addManual}
                    disabled={!draftName.trim()}
                    style={[styles.addBtn, !draftName.trim() && styles.addBtnDisabled]}
                    accessibilityLabel={tCheckin("medications.add")}
                >
                    <Plus size={22} color={theme.colors.onPrimary} strokeWidth={2.4} />
                </Pressable>
            </View>

            {/* Catálogo existente */}
            {catalog && catalog.length > 0 ? (
                <>
                    <SectionTitle hint={tCheckin("medications.empty")}>{tCheckin("medications.title")}</SectionTitle>
                    <ChoiceGrid>
                        {catalog.map((med) => (
                            <ChoiceCard
                                key={med.id}
                                label={med.name}
                                selected={isCatalogOn(med.id)}
                                onPress={() => toggleCatalog(med.id, med.name)}
                            />
                        ))}
                    </ChoiceGrid>
                </>
            ) : null}

            {/* Medicamentos ya en el borrador (manuales + catálogo), con dosis + alivio */}
            {medications.length > 0 ? <View style={styles.medList}>{medications.map(renderMed)}</View> : null}

            <View style={screenStyles.footer}>
                <PrimaryButton label={tCommon("action.continue")} onPress={onContinue} testID="checkin-next" />
                <CheckinSaveButton onSaved={onSaved} />
            </View>
        </CheckinScreen>
    );
}
