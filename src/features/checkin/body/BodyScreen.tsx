import type { LucideIcon } from "lucide-react-native";
import {
    Baby,
    CircleOff,
    Clock,
    Droplet,
    Droplets,
    Gauge,
    Heart,
    HeartCrack,
    HeartPulse,
    Minus,
    Sparkles,
    Thermometer,
    Waves,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Fragment } from "react";
import { Text, TextInput, View } from "react-native";

import type { ReproductiveMode } from "@/db/enums/reproductiveMode";
import { useActiveIntent } from "@/domain/hooks/useActiveIntent";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { useTheme } from "@/theme/useTheme";
import { bodySectionsFor, type BodySections } from "@/features/checkin/shared/bodySections";
import { CheckinHeader } from "@/features/checkin/shared/components/checkin-screen/CheckinHeader";
import { CheckinScreen } from "@/features/checkin/shared/components/checkin-screen/CheckinScreen";
import { SectionTitle } from "@/features/checkin/shared/components/checkin-screen/SectionTitle";
import { ChoiceCard } from "@/features/checkin/shared/components/choice-card/ChoiceCard";
import { ChoiceGrid } from "@/features/checkin/shared/components/choice-card/ChoiceGrid";
import { useCheckinStore } from "@/features/checkin/shared/stores/useCheckinStore";
import type { CheckinDraft } from "@/features/checkin/shared/types/CheckinDraft";

import { useBodyStyles } from "./BodyStyle";

type ScaleField = "cervicalMucus" | "cervicalPosition" | "libido" | "morningSickness" | "fetalMovement";
type ScaleSection = keyof Omit<BodySections, "bbt" | "bbtTime" | "weight">;

type ScaleDef = {
    field: ScaleField;
    section: ScaleSection;
    titleKey: string;
    levelsKey: string;
    columns: 2 | 3;
    /** Icono específico por nivel (regla design-system: icono = identidad, no número). */
    levelIcons: readonly LucideIcon[];
};

const MUCUS_ICONS: readonly LucideIcon[] = [CircleOff, Droplet, Droplets, Waves, Sparkles];
const CERVIX_ICONS: readonly LucideIcon[] = [Minus, Gauge, Gauge];
const LIBIDO_ICONS: readonly LucideIcon[] = [CircleOff, HeartCrack, Heart, HeartPulse];
const SICKNESS_ICONS: readonly LucideIcon[] = [CircleOff, Droplet, Waves, Clock];
const MOVEMENT_ICONS: readonly LucideIcon[] = [CircleOff, Baby, Baby, Baby];

const SCALES: readonly ScaleDef[] = [
    {
        field: "cervicalMucus",
        section: "mucus",
        titleKey: "body.mucus.title",
        levelsKey: "body.mucus.level",
        columns: 2,
        levelIcons: MUCUS_ICONS,
    },
    {
        field: "cervicalPosition",
        section: "cervix",
        titleKey: "body.cervix.title",
        levelsKey: "body.cervix.level",
        columns: 3,
        levelIcons: CERVIX_ICONS,
    },
    {
        field: "libido",
        section: "libido",
        titleKey: "body.libido.title",
        levelsKey: "body.libido.level",
        columns: 3,
        levelIcons: LIBIDO_ICONS,
    },
    {
        field: "morningSickness",
        section: "morningSickness",
        titleKey: "body.morningSickness.title",
        levelsKey: "body.morningSickness.level",
        columns: 3,
        levelIcons: SICKNESS_ICONS,
    },
    {
        field: "fetalMovement",
        section: "fetalMovement",
        titleKey: "body.fetalMovement.title",
        levelsKey: "body.fetalMovement.level",
        columns: 3,
        levelIcons: MOVEMENT_ICONS,
    },
];

type Props = {
    onContinue: () => void;
};

/**
 * Check-in paso 4: cuerpo. Las señales mostradas se adaptan al modo reproductivo
 * activo (tabla "Pasos por modo" del plan 02): moco y libido siempre; cervix
 * solo TTC; BBT con hora en TTC; peso opcional (excepto avoid); náuseas y
 * movimiento fetal solo en pregnancy.
 *
 * Regla rectora del design-system (`icons.html §03-04`): ningún número como
 * identidad de captura. Cada nivel lleva su icono específico (espejo del mockup
 * `.choice-grid`). BBT y peso usan display grande (`bbt-val` 34px) con unidad
 * al lado, no un TextInput chico.
 */
export default function BodyScreen({ onContinue }: Props) {
    const { t } = useTranslation("checkIn");
    const { t: tCommon } = useTranslation("common");
    const theme = useTheme();
    const styles = useBodyStyles();
    const set = useCheckinStore((state) => state.set);
    const { profile } = useLocalProfile();
    const { intent } = useActiveIntent(profile?.id ?? "");
    const mode = intent?.reproductiveMode as ReproductiveMode | undefined;
    const sections = bodySectionsFor(mode);

    const cervicalMucus = useCheckinStore((state) => state.draft.cervicalMucus);
    const cervicalPosition = useCheckinStore((state) => state.draft.cervicalPosition);
    const libido = useCheckinStore((state) => state.draft.libido);
    const morningSickness = useCheckinStore((state) => state.draft.morningSickness);
    const fetalMovement = useCheckinStore((state) => state.draft.fetalMovement);
    const basalBodyTempC = useCheckinStore((state) => state.draft.basalBodyTempC);
    const basalBodyTempTime = useCheckinStore((state) => state.draft.basalBodyTempTime);
    const weightKg = useCheckinStore((state) => state.draft.weightKg);

    const draftValues: Record<ScaleField, number | null> = {
        cervicalMucus,
        cervicalPosition,
        libido,
        morningSickness,
        fetalMovement,
    };

    return (
        <CheckinScreen cta={{ label: tCommon("action.continue"), onPress: onContinue }}>
            <CheckinHeader Icon={Thermometer} title={t("steps.body")} lead={undefined} />

            {SCALES.filter((def) => sections[def.section]).map((def) => {
                const current = draftValues[def.field];
                return (
                    <Fragment key={def.field}>
                        <SectionTitle>{t(def.titleKey as never)}</SectionTitle>
                        <ChoiceGrid columns={def.columns}>
                            {def.levelIcons.map((LevelIcon, value) => (
                                <ChoiceCard
                                    key={value}
                                    Icon={LevelIcon}
                                    label={t(`${def.levelsKey}.${value}` as never)}
                                    selected={current === value}
                                    onPress={() => {
                                        const patch: Partial<CheckinDraft> =
                                            current === value ? { [def.field]: null } : { [def.field]: value };
                                        set(patch);
                                    }}
                                />
                            ))}
                        </ChoiceGrid>
                    </Fragment>
                );
            })}

            {sections.bbt ? (
                <>
                    <SectionTitle hint={t("body.bbt.hint")}>{t("body.bbt.title")}</SectionTitle>
                    <View style={styles.valueRow}>
                        <TextInput
                            style={styles.valueInput}
                            value={basalBodyTempC !== null ? formatNumber(basalBodyTempC) : ""}
                            onChangeText={(text) => {
                                const parsed = Number.parseFloat(text);
                                set({ basalBodyTempC: Number.isNaN(parsed) ? null : parsed });
                            }}
                            placeholder="36.5"
                            placeholderTextColor={theme.colors.placeholder}
                            keyboardType="decimal-pad"
                            inputMode="decimal"
                            accessibilityLabel={t("body.bbt.title")}
                        />
                        <Text style={styles.valueUnit}>{t("body.bbt.unit")}</Text>
                    </View>
                    {sections.bbtTime ? (
                        <View style={styles.timeRow}>
                            <Clock size={theme.sizing.iconSm} color={theme.colors.primary} strokeWidth={2.2} />
                            <TextInput
                                style={styles.timeInput}
                                value={basalBodyTempTime ?? ""}
                                onChangeText={(text) => set({ basalBodyTempTime: text || null })}
                                placeholder="07:00"
                                placeholderTextColor={theme.colors.placeholder}
                                keyboardType="numbers-and-punctuation"
                                accessibilityLabel={t("body.bbt.timeLabel")}
                            />
                        </View>
                    ) : null}
                </>
            ) : null}

            {sections.weight ? (
                <>
                    <SectionTitle hint={t("body.weight.hint")}>{t("body.weight.title")}</SectionTitle>
                    <View style={styles.valueRow}>
                        <TextInput
                            style={[styles.valueInput, styles.valueInputSmall]}
                            value={weightKg !== null ? formatNumber(weightKg) : ""}
                            onChangeText={(text) => {
                                const parsed = Number.parseFloat(text);
                                set({ weightKg: Number.isNaN(parsed) ? null : parsed });
                            }}
                            placeholder="62.0"
                            placeholderTextColor={theme.colors.placeholder}
                            keyboardType="decimal-pad"
                            inputMode="decimal"
                            accessibilityLabel={t("body.weight.title")}
                        />
                        <Text style={styles.valueUnit}>{t("body.weight.unit")}</Text>
                    </View>
                </>
            ) : null}
        </CheckinScreen>
    );
}

/** Formatea un número sin ceros sobrantes (36.50 -> 36.5, 62 -> 62). */
function formatNumber(value: number): string {
    return Number.isInteger(value) ? String(value) : String(value);
}
