import { Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";

import { useReviewStyles } from "./ReviewStyle";
import { CheckinHeader } from "@/features/checkin/shared/components/checkin-screen/CheckinHeader";
import { CheckinScreen } from "@/features/checkin/shared/components/checkin-screen/CheckinScreen";
import { useCompleteCheckin } from "@/features/checkin/shared/hooks/useCompleteCheckin";
import { useCheckinStore } from "@/features/checkin/shared/stores/useCheckinStore";

type Props = {
    onSaved: () => void;
};

/**
 * Check-in paso final: resumen y guardado. Persiste el check-in (+ síntomas,
 * medicación) en una transacción y dispara el recálculo del motor. Cada sección
 * muestra el resumen del borrador; "Guardar" está siempre disponible.
 */
export default function ReviewScreen({ onSaved }: Props) {
    const { t } = useTranslation("checkIn");
    const { t: tCommon } = useTranslation("common");
    const styles = useReviewStyles();
    const draft = useCheckinStore((state) => state.draft);
    const { submit, isSubmitting, isEmpty } = useCompleteCheckin();

    const save = async () => {
        const ok = await submit();
        if (ok) {
            Alert.alert(tCommon("feedback.success"), t("review.savedToast"));
            onSaved();
        }
    };

    const lines: { label: string; value: string | null }[] = [];
    if (draft.bleedingIntensity !== null) {
        lines.push({
            label: t("review.sectionBleeding"),
            value: t(`bleeding.level.${draft.bleedingIntensity}` as never),
        });
    }
    if (draft.mood !== null) {
        lines.push({
            label: t("review.sectionFeelings"),
            value: t(`feelings.mood.level.${draft.mood}` as never),
        });
    }
    if (draft.symptoms.length > 0) {
        lines.push({
            label: t("review.sectionSymptoms"),
            value: t("symptomStep.selectedCount_other", { count: draft.symptoms.length }),
        });
    }
    if (draft.medications.length > 0) {
        lines.push({
            label: t("review.sectionMedications"),
            value: draft.medications
                .map((m) => m.name ?? "")
                .filter(Boolean)
                .join(", "),
        });
    }
    if (draft.note) {
        lines.push({ label: t("review.sectionNote"), value: draft.note });
    }

    return (
        <CheckinScreen
            cta={{
                label: t("review.save"),
                onPress: save,
                disabled: isSubmitting || isEmpty,
                Icon: Check,
            }}
        >
            <CheckinHeader Icon={Check} title={t("review.title")} lead={t("review.hint")} />

            {isEmpty ? (
                <Text style={styles.empty}>{t("review.empty")}</Text>
            ) : (
                <View style={styles.summary}>
                    <Text style={styles.editHint}>{t("review.editHint")}</Text>
                    {lines.map((line) => (
                        <View key={line.label} style={styles.row}>
                            <Text style={styles.rowLabel}>{line.label}</Text>
                            <Text style={styles.rowValue}>{line.value}</Text>
                        </View>
                    ))}
                </View>
            )}
        </CheckinScreen>
    );
}
