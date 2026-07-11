import type { LucideIcon } from "lucide-react-native";
import {
    CloudDrizzle,
    CloudRain,
    CircleOff,
    Droplet,
    Droplets,
    Grip,
    Minus,
    CircleDot,
    Play,
    Square,
    RefreshCw,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";

import type { PeriodStatusSignal } from "@/db/enums/checkin";
import { CheckinHeader } from "@/features/checkin/shared/components/checkin-screen/CheckinHeader";
import { CheckinScreen } from "@/features/checkin/shared/components/checkin-screen/CheckinScreen";
import { SectionTitle } from "@/features/checkin/shared/components/checkin-screen/SectionTitle";
import { ChoiceCard } from "@/features/checkin/shared/components/choice-card/ChoiceCard";
import { ChoiceGrid } from "@/features/checkin/shared/components/choice-card/ChoiceGrid";

import { useCheckinStore } from "../shared/stores/useCheckinStore";

type BleedingOption = {
    value: number;
    Icon: LucideIcon;
    labelKey: "bleeding.level.0" | "bleeding.level.1" | "bleeding.level.2" | "bleeding.level.3" | "bleeding.level.4";
};

const BLEEDING_OPTIONS: readonly BleedingOption[] = [
    { value: 0, Icon: CircleOff, labelKey: "bleeding.level.0" },
    { value: 1, Icon: Droplet, labelKey: "bleeding.level.1" },
    { value: 2, Icon: Droplets, labelKey: "bleeding.level.2" },
    { value: 3, Icon: CloudDrizzle, labelKey: "bleeding.level.3" },
    { value: 4, Icon: CloudRain, labelKey: "bleeding.level.4" },
];

type ClotOption = {
    value: number;
    Icon: LucideIcon;
    labelKey: "bleeding.clots.level.0" | "bleeding.clots.level.1" | "bleeding.clots.level.2" | "bleeding.clots.level.3";
};

const CLOT_OPTIONS: readonly ClotOption[] = [
    { value: 0, Icon: Minus, labelKey: "bleeding.clots.level.0" },
    { value: 1, Icon: CircleDot, labelKey: "bleeding.clots.level.1" },
    { value: 2, Icon: Grip, labelKey: "bleeding.clots.level.2" },
    { value: 3, Icon: Grip, labelKey: "bleeding.clots.level.3" },
];

type SignalOption = {
    value: PeriodStatusSignal;
    Icon: LucideIcon;
    labelKey: "bleeding.periodSignal.started" | "bleeding.periodSignal.ongoing" | "bleeding.periodSignal.ended";
};

const SIGNAL_OPTIONS: readonly SignalOption[] = [
    { value: "started", Icon: Play, labelKey: "bleeding.periodSignal.started" },
    { value: "ongoing", Icon: RefreshCw, labelKey: "bleeding.periodSignal.ongoing" },
    { value: "ended", Icon: Square, labelKey: "bleeding.periodSignal.ended" },
];

type Props = {
    onContinue: () => void;
};

/** Check-in paso 1: sangrado, coágulos y señal de periodo. */
export default function BleedingScreen({ onContinue }: Props) {
    const { t } = useTranslation("checkIn");
    const { t: tCommon } = useTranslation("common");
    const set = useCheckinStore((state) => state.set);
    const bleedingIntensity = useCheckinStore((state) => state.draft.bleedingIntensity);
    const clots = useCheckinStore((state) => state.draft.clots);
    const periodStatusSignal = useCheckinStore((state) => state.draft.periodStatusSignal);

    return (
        <CheckinScreen cta={{ label: tCommon("action.continue"), onPress: onContinue }}>
            <CheckinHeader Icon={Droplet} title={t("bleeding.title")} lead={t("bleeding.hint")} />

            <SectionTitle>{t("bleeding.title")}</SectionTitle>
            <ChoiceGrid columns={2}>
                {BLEEDING_OPTIONS.map((option) => (
                    <ChoiceCard
                        key={option.value}
                        Icon={option.Icon}
                        label={t(option.labelKey)}
                        selected={bleedingIntensity === option.value}
                        onPress={() =>
                            set({
                                bleedingIntensity: bleedingIntensity === option.value ? null : option.value,
                            })
                        }
                    />
                ))}
            </ChoiceGrid>

            <SectionTitle>{t("bleeding.clots.title")}</SectionTitle>
            <ChoiceGrid columns={3}>
                {CLOT_OPTIONS.map((option) => (
                    <ChoiceCard
                        key={option.value}
                        Icon={option.Icon}
                        label={t(option.labelKey)}
                        selected={clots === option.value}
                        onPress={() => set({ clots: clots === option.value ? null : option.value })}
                    />
                ))}
            </ChoiceGrid>

            <SectionTitle>{t("bleeding.periodSignal.title")}</SectionTitle>
            <ChoiceGrid columns={3}>
                {SIGNAL_OPTIONS.map((option) => (
                    <ChoiceCard
                        key={option.value}
                        Icon={option.Icon}
                        label={t(option.labelKey)}
                        selected={periodStatusSignal === option.value}
                        onPress={() =>
                            set({
                                periodStatusSignal: periodStatusSignal === option.value ? null : option.value,
                            })
                        }
                    />
                ))}
            </ChoiceGrid>
        </CheckinScreen>
    );
}
