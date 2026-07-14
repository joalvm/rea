import { Sparkles, Waves } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button/PrimaryButton";
import { CheckinHeader } from "@/features/checkin/shared/components/checkin-screen/CheckinHeader";
import { CheckinScreen } from "@/features/checkin/shared/components/checkin-screen/CheckinScreen";
import { CheckinSaveButton } from "@/features/checkin/shared/components/checkin-screen/CheckinSaveButton";
import { SectionTitle } from "@/features/checkin/shared/components/checkin-screen/SectionTitle";
import { useCheckinScreenStyles } from "@/features/checkin/shared/components/checkin-screen/CheckinScreenStyle";
import { MultiChip } from "@/features/checkin/shared/components/multi-chip/MultiChip";
import { useCheckinStepMetric } from "@/features/checkin/shared/dev/useCheckinStepMetric";
import { usePrefillCheckin } from "@/features/checkin/shared/hooks/usePrefillCheckin";
import { useQuickOptions } from "@/features/checkin/shared/hooks/useQuickOptions";
import { resolveLabel } from "@/features/checkin/shared/services/resolveLabel";
import { useCheckinStore } from "@/features/checkin/shared/stores/useCheckinStore";
import { useCheckinIntroStyles } from "./CheckinIntroStyle";

type Props = {
    onStart: () => void;
    onSaved: () => void;
};

/**
 * Check-in (entrada). Reemplaza las 3 tarjetas de modo muertas (O-01) por una
 * captura rápida directa: quick-options del catálogo (`is_quick_option`) arriba
 * + "Empezar registro" (wizard completo) + "Guardar ahora" (guarda lo
 * seleccionado y sale). Al reabrir, hidrata el draft con el último check-in del
 * día como punto de partida (Fase 4).
 *
 * Flujo de velocidad:
 * - Día normal: toca 1-2 quick-options, "Guardar ahora" → 3 taps, <15 s.
 * - Día vacío: "Guardar ahora" sin seleccionar nada → 1 tap (no-op + salida).
 * - Registro completo: "Empezar registro" → wizard de 9 pasos.
 */
export default function CheckinIntroScreen({ onStart, onSaved }: Props) {
    const { t } = useTranslation();
    const { t: tCheckin } = useTranslation("checkIn");
    const { t: tCommon } = useTranslation("common");
    const styles = useCheckinIntroStyles();
    const screenStyles = useCheckinScreenStyles();

    const { options } = useQuickOptions();
    const { hasTodayCheckin, loading } = usePrefillCheckin();

    const symptoms = useCheckinStore((state) => state.draft.symptoms);
    const toggleSymptom = useCheckinStore((state) => state.toggleSymptom);
    const setSymptomIntensity = useCheckinStore((state) => state.setSymptomIntensity);

    useCheckinStepMetric("intro");

    const isOn = (key: string) => symptoms.some((s) => s.symptomKey === key);
    const intensityOf = (key: string) => symptoms.find((s) => s.symptomKey === key)?.intensity ?? 0;

    const selectedSymptoms = options.filter((opt) => isOn(opt.symptomKey));

    return (
        <CheckinScreen>
            <CheckinHeader Icon={Waves} title={tCheckin("intro.title")} lead={tCheckin("intro.lead")} />

            {hasTodayCheckin ? (
                <SectionTitle hint={tCheckin("intro.continuingToday")}>{tCheckin("intro.quickSection")}</SectionTitle>
            ) : (
                <SectionTitle>{tCheckin("intro.quickSection")}</SectionTitle>
            )}

            {options.length === 0 && !loading ? (
                <Text style={styles.empty}>{tCheckin("intro.noQuickOptions")}</Text>
            ) : (
                <View style={styles.chipsWrap}>
                    {options.map((option) => {
                        const on = isOn(option.symptomKey);
                        return (
                            <MultiChip
                                key={option.symptomKey}
                                label={resolveLabel(option.labelKey, t)}
                                selected={on}
                                level={on ? intensityOf(option.symptomKey) : undefined}
                                onPress={() => toggleSymptom(option.symptomKey)}
                                testID={`quick-option-${option.symptomKey}`}
                            />
                        );
                    })}
                </View>
            )}

            {selectedSymptoms.length > 0 ? (
                <View style={styles.intensityWrap}>
                    {selectedSymptoms.map((symptom) => (
                        <View key={symptom.symptomKey} style={styles.intensityRow}>
                            <Text style={styles.intensityLabel}>{resolveLabel(symptom.labelKey, t)}</Text>
                            <View style={styles.intensityDots}>
                                {[1, 2, 3, 4, 5].map((level) => {
                                    const active = intensityOf(symptom.symptomKey) >= level;
                                    return (
                                        <Text
                                            key={level}
                                            onPress={() => setSymptomIntensity(symptom.symptomKey, level)}
                                            style={[styles.intensityDot, active && styles.intensityDotOn]}
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

            <View style={screenStyles.footer}>
                <PrimaryButton label={tCheckin("intro.startFull")} onPress={onStart} Icon={Sparkles} testID="checkin-start" />
                <CheckinSaveButton onSaved={onSaved} allowEmpty />
            </View>
        </CheckinScreen>
    );
}
