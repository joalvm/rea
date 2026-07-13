import { Check } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";

import { useReviewStyles } from "./ReviewStyle";
import { PositiveTestCard } from "@/features/checkin/shared/components/positive-test-card/PositiveTestCard";
import { CheckinHeader } from "@/features/checkin/shared/components/checkin-screen/CheckinHeader";
import { CheckinScreen } from "@/features/checkin/shared/components/checkin-screen/CheckinScreen";
import { useCheckinScreenStyles } from "@/features/checkin/shared/components/checkin-screen/CheckinScreenStyle";
import { PrimaryButton } from "@/components/primary-button/PrimaryButton";
import { useCompleteCheckin } from "@/features/checkin/shared/hooks/useCompleteCheckin";
import { useCheckinStore } from "@/features/checkin/shared/stores/useCheckinStore";

type Props = {
    onSaved: () => void;
};

/**
 * Check-in paso final: resumen y guardado. Persiste el check-in (+ síntomas,
 * medicación, relaciones) en una transacción y dispara el recálculo del motor.
 * Cada sección muestra el resumen del borrador; "Guardar" está siempre disponible.
 *
 * Si el test de embarazo dio positivo, tras guardar se muestra la tarjeta neutra
 * `PositiveTestCard` (puente al plan 10, aún en stub) en lugar del toast simple.
 */
export default function ReviewScreen({ onSaved }: Props) {
    const { t } = useTranslation("checkIn");
    const { t: tCommon } = useTranslation("common");
    const styles = useReviewStyles();
    const screenStyles = useCheckinScreenStyles();
    const draft = useCheckinStore((state) => state.draft);
    const { submit, isSubmitting, isEmpty, isEditing } = useCompleteCheckin();
    const [showPositiveCard, setShowPositiveCard] = useState(false);

    const save = async () => {
        // Capturar antes de submit: submit() resetea el store.
        const wasPositive = draft.pregnancyTestResult === "positive";
        const ok = await submit();
        if (ok) {
            if (wasPositive) {
                setShowPositiveCard(true);
            } else {
                Alert.alert(tCommon("feedback.success"), t("review.savedToast"));
                onSaved();
            }
        }
    };

    const handlePositiveDismiss = () => {
        setShowPositiveCard(false);
        onSaved();
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
    const bodyParts: string[] = [];
    if (draft.cervicalMucus !== null) {
        bodyParts.push(`${t("body.mucus.title")}: ${t(`body.mucus.level.${draft.cervicalMucus}` as never)}`);
    }
    if (draft.cervicalPosition !== null) {
        bodyParts.push(`${t("body.cervix.title")}: ${t(`body.cervix.level.${draft.cervicalPosition}` as never)}`);
    }
    if (draft.basalBodyTempC !== null) {
        bodyParts.push(`${t("body.bbt.title")}: ${draft.basalBodyTempC} ${t("body.bbt.unit")}`);
    }
    if (draft.libido !== null) {
        bodyParts.push(`${t("body.libido.title")}: ${t(`body.libido.level.${draft.libido}` as never)}`);
    }
    if (draft.weightKg !== null) {
        bodyParts.push(`${t("body.weight.title")}: ${draft.weightKg} ${t("body.weight.unit")}`);
    }
    if (draft.morningSickness !== null) {
        bodyParts.push(
            `${t("body.morningSickness.title")}: ${t(`body.morningSickness.level.${draft.morningSickness}` as never)}`,
        );
    }
    if (draft.fetalMovement !== null) {
        bodyParts.push(
            `${t("body.fetalMovement.title")}: ${t(`body.fetalMovement.level.${draft.fetalMovement}` as never)}`,
        );
    }
    if (bodyParts.length > 0) {
        lines.push({ label: t("review.sectionBody"), value: bodyParts.join(" · ") });
    }
    if (draft.symptoms.length > 0) {
        lines.push({
            label: t("review.sectionSymptoms"),
            value: t("symptomStep.selectedCount_other", { count: draft.symptoms.length }),
        });
    }
    const fertilityParts: string[] = [];
    if (draft.pregnancyTestResult) {
        fertilityParts.push(
            `${t("fertility.pregnancyTest.title")}: ${t(`fertility.pregnancyTest.${draft.pregnancyTestResult}` as never)}`,
        );
    }
    if (draft.opkResult) {
        fertilityParts.push(`${t("fertility.opk.title")}: ${t(`fertility.opk.${draft.opkResult}` as never)}`);
    }
    if (draft.intercourse !== null) {
        const intercourseLabel = draft.intercourse.isProtected
            ? t("fertility.intercourse.protected")
            : t("fertility.intercourse.had");
        fertilityParts.push(`${t("fertility.intercourse.title")}: ${intercourseLabel}`);
    }
    if (fertilityParts.length > 0) {
        lines.push({ label: t("review.sectionFertility"), value: fertilityParts.join(" · ") });
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
        <CheckinScreen>
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

            <PositiveTestCard visible={showPositiveCard} onDismiss={handlePositiveDismiss} />

            <View style={screenStyles.footer}>
                <PrimaryButton
                    label={isEditing ? t("review.saveEdit") : t("review.save")}
                    onPress={save}
                    disabled={isSubmitting || isEmpty}
                    Icon={Check}
                />
            </View>
        </CheckinScreen>
    );
}
