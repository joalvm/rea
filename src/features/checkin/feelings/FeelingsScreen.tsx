import type { LucideIcon } from "lucide-react-native";
import {
    Activity,
    Battery,
    BatteryCharging,
    BatteryLow,
    BatteryMedium,
    Cloud,
    Flame,
    Frown,
    Laugh,
    Leaf,
    Meh,
    Smile,
    SmilePlus,
    Waves,
    Zap,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { CheckinHeader } from "@/features/checkin/shared/components/checkin-screen/CheckinHeader";
import { CheckinScreen } from "@/features/checkin/shared/components/checkin-screen/CheckinScreen";
import { SectionTitle } from "@/features/checkin/shared/components/checkin-screen/SectionTitle";
import { useCheckinScreenStyles } from "@/features/checkin/shared/components/checkin-screen/CheckinScreenStyle";
import { ChoiceCard } from "@/features/checkin/shared/components/choice-card/ChoiceCard";
import { ChoiceGrid } from "@/features/checkin/shared/components/choice-card/ChoiceGrid";
import type { CheckinDraft } from "@/features/checkin/shared/types/CheckinDraft";
import { PrimaryButton } from "@/components/primary-button/PrimaryButton";

import { useCheckinStore } from "../shared/stores/useCheckinStore";

type MoodKey =
    | "feelings.mood.level.1"
    | "feelings.mood.level.2"
    | "feelings.mood.level.3"
    | "feelings.mood.level.4"
    | "feelings.mood.level.5";
type EnergyKey =
    | "feelings.energy.level.1"
    | "feelings.energy.level.2"
    | "feelings.energy.level.3"
    | "feelings.energy.level.4"
    | "feelings.energy.level.5";
type StressKey =
    | "feelings.stress.level.0"
    | "feelings.stress.level.1"
    | "feelings.stress.level.2"
    | "feelings.stress.level.3"
    | "feelings.stress.level.4"
    | "feelings.stress.level.5";

type ScaleField = "mood" | "energy" | "stressLevel";
type Option = { value: number; Icon: LucideIcon };

const MOOD_OPTIONS: readonly (Option & { labelKey: MoodKey })[] = [
    { value: 1, Icon: Frown, labelKey: "feelings.mood.level.1" },
    { value: 2, Icon: Meh, labelKey: "feelings.mood.level.2" },
    { value: 3, Icon: Smile, labelKey: "feelings.mood.level.3" },
    { value: 4, Icon: SmilePlus, labelKey: "feelings.mood.level.4" },
    { value: 5, Icon: Laugh, labelKey: "feelings.mood.level.5" },
];

const ENERGY_OPTIONS: readonly (Option & { labelKey: EnergyKey })[] = [
    { value: 1, Icon: BatteryLow, labelKey: "feelings.energy.level.1" },
    { value: 2, Icon: Battery, labelKey: "feelings.energy.level.2" },
    { value: 3, Icon: BatteryMedium, labelKey: "feelings.energy.level.3" },
    { value: 4, Icon: BatteryCharging, labelKey: "feelings.energy.level.4" },
    { value: 5, Icon: Zap, labelKey: "feelings.energy.level.5" },
];

// Estrés 0–5: escala canónica de icons.html §04 (Calma → Límite).
const STRESS_OPTIONS: readonly (Option & { labelKey: StressKey })[] = [
    { value: 0, Icon: Leaf, labelKey: "feelings.stress.level.0" },
    { value: 1, Icon: Cloud, labelKey: "feelings.stress.level.1" },
    { value: 2, Icon: Waves, labelKey: "feelings.stress.level.2" },
    { value: 3, Icon: Activity, labelKey: "feelings.stress.level.3" },
    { value: 4, Icon: Flame, labelKey: "feelings.stress.level.4" },
    { value: 5, Icon: Flame, labelKey: "feelings.stress.level.5" },
];

type Props = {
    onContinue: () => void;
};

/** Check-in paso 2: ánimo, energía y estrés (escalas graduables con iconos). */
export default function FeelingsScreen({ onContinue }: Props) {
    const { t } = useTranslation("checkIn");
    const { t: tCommon } = useTranslation("common");
    const set = useCheckinStore((state) => state.set);
    const mood = useCheckinStore((state) => state.draft.mood);
    const energy = useCheckinStore((state) => state.draft.energy);
    const stressLevel = useCheckinStore((state) => state.draft.stressLevel);
    const screenStyles = useCheckinScreenStyles();

    const renderScale = (
        title: string,
        options: readonly (Option & { labelKey: string })[],
        current: number | null,
        field: ScaleField,
    ) => (
        <>
            <SectionTitle>{title}</SectionTitle>
            <ChoiceGrid>
                {options.map((option) => (
                    <ChoiceCard
                        key={option.value}
                        Icon={option.Icon}
                        label={t(option.labelKey as never)}
                        selected={current === option.value}
                        onPress={() => {
                            const patch: Partial<CheckinDraft> =
                                current === option.value ? { [field]: null } : { [field]: option.value };
                            set(patch);
                        }}
                    />
                ))}
            </ChoiceGrid>
        </>
    );

    return (
        <CheckinScreen>
            <CheckinHeader Icon={Smile} title={t("feelings.mood.title")} lead={undefined} />

            {renderScale(t("feelings.mood.title"), MOOD_OPTIONS, mood, "mood")}
            {renderScale(t("feelings.energy.title"), ENERGY_OPTIONS, energy, "energy")}
            {renderScale(t("feelings.stress.title"), STRESS_OPTIONS, stressLevel, "stressLevel")}

            <View style={screenStyles.footer}>
                <PrimaryButton label={tCommon("action.continue")} onPress={onContinue} />
            </View>
        </CheckinScreen>
    );
}
