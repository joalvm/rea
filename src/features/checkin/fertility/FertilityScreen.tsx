import { Heart, ShieldCheck, TrendingUp, TriangleAlert, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Fragment } from "react";
import { View } from "react-native";

import type { QualitativeTestResult } from "@/db/enums/checkin";
import type { ReproductiveMode } from "@/db/enums/reproductiveMode";
import { useActiveIntent } from "@/domain/hooks/useActiveIntent";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { ToggleRow } from "@/components/toggle-row/ToggleRow";
import { PrimaryButton } from "@/components/primary-button/PrimaryButton";
import { fertilitySectionsFor } from "@/features/checkin/shared/bodySections";
import { CheckinHeader } from "@/features/checkin/shared/components/checkin-screen/CheckinHeader";
import { CheckinScreen } from "@/features/checkin/shared/components/checkin-screen/CheckinScreen";
import { CheckinSaveButton } from "@/features/checkin/shared/components/checkin-screen/CheckinSaveButton";
import { SectionTitle } from "@/features/checkin/shared/components/checkin-screen/SectionTitle";
import { useCheckinScreenStyles } from "@/features/checkin/shared/components/checkin-screen/CheckinScreenStyle";
import {
    SegmentedControl,
    type SegmentedOption,
} from "@/features/checkin/shared/components/segmented-control/SegmentedControl";
import { useCheckinStore } from "@/features/checkin/shared/stores/useCheckinStore";
import type { CheckinDraft } from "@/features/checkin/shared/types/CheckinDraft";
import { useCheckinStepMetric } from "@/features/checkin/shared/dev/useCheckinStepMetric";

import { useFertilityStyles } from "./FertilityStyle";

type TestKind = "opk" | "pregnancyTest";
type TestField = "opkResult" | "pregnancyTestResult";

type TestDef = {
    field: TestField;
    kind: TestKind;
    titleKey: string;
    hintKey: string;
    options: readonly TestOption[];
};

type TestOption = SegmentedOption<QualitativeTestResult> & { labelKey: string };

const PREGNANCY_TEST_OPTIONS: readonly TestOption[] = [
    { value: "negative", label: "", labelKey: "fertility.pregnancyTest.negative", Icon: X },
    { value: "positive", label: "", labelKey: "fertility.pregnancyTest.positive", Icon: TrendingUp },
    { value: "invalid", label: "", labelKey: "fertility.pregnancyTest.invalid", Icon: TriangleAlert },
];

const OPK_OPTIONS: readonly TestOption[] = [
    { value: "negative", label: "", labelKey: "fertility.opk.negative", Icon: X },
    { value: "positive", label: "", labelKey: "fertility.opk.positive", Icon: TrendingUp },
    { value: "invalid", label: "", labelKey: "fertility.opk.invalid", Icon: TriangleAlert },
];

const TEST_DEFS: readonly TestDef[] = [
    {
        field: "pregnancyTestResult",
        kind: "pregnancyTest",
        titleKey: "fertility.pregnancyTest.title",
        hintKey: "fertility.pregnancyTest.hint",
        options: PREGNANCY_TEST_OPTIONS,
    },
    {
        field: "opkResult",
        kind: "opk",
        titleKey: "fertility.opk.title",
        hintKey: "fertility.pregnancyTest.hint",
        options: OPK_OPTIONS,
    },
];

type Props = {
    onContinue: () => void;
    onSaved: () => void;
};

/**
 * Check-in paso 5: fertilidad y tests. Test de embarazo en todos los modos de
 * ciclo (no pregnancy); OPK solo en TTC; relaciones en todos los modos. Los
 * tests usan `SegmentedControl` (espejo de `.seg` del design-system: icono +
 * etiqueta por opción, tap para seleccionar, tap de nuevo para deseleccionar).
 * Las relaciones usan `ToggleRow` (switch nativo), no tarjetas.
 */
export default function FertilityScreen({ onContinue, onSaved }: Props) {
    const { t } = useTranslation("checkIn");
    const { t: tCommon } = useTranslation("common");
    useCheckinStepMetric("fertility");
    useFertilityStyles();
    const screenStyles = useCheckinScreenStyles();
    const set = useCheckinStore((state) => state.set);
    const { profile } = useLocalProfile();
    const { intent } = useActiveIntent(profile?.id ?? "");
    const mode = intent?.reproductiveMode as ReproductiveMode | undefined;
    const sections = fertilitySectionsFor(mode);

    const opkResult = useCheckinStore((state) => state.draft.opkResult);
    const pregnancyTestResult = useCheckinStore((state) => state.draft.pregnancyTestResult);
    const intercourse = useCheckinStore((state) => state.draft.intercourse);

    const valueFor = (field: TestField): QualitativeTestResult | null =>
        field === "opkResult" ? opkResult : pregnancyTestResult;

    const hadIntercourse = intercourse !== null;
    const isProtected = intercourse?.isProtected ?? false;

    return (
        <CheckinScreen>
            <CheckinHeader Icon={Heart} title={t("fertility.title")} lead={undefined} />

            {TEST_DEFS.filter((def) => (def.kind === "opk" ? sections.opk : sections.pregnancyTest)).map((def) => {
                const current = valueFor(def.field);
                const options = def.options.map((opt) => ({ ...opt, label: t(opt.labelKey as never) }));
                return (
                    <Fragment key={def.field}>
                        <SectionTitle hint={t(def.hintKey as never)}>{t(def.titleKey as never)}</SectionTitle>
                        <SegmentedControl
                            options={options}
                            value={current}
                            onChange={(value) => set({ [def.field]: value } as Partial<CheckinDraft>)}
                        />
                    </Fragment>
                );
            })}

            {sections.intercourse ? (
                <>
                    <SectionTitle>{t("fertility.intercourse.title")}</SectionTitle>
                    <ToggleRow
                        title={t("fertility.intercourse.had")}
                        Icon={Heart}
                        value={hadIntercourse}
                        onChange={(on) => {
                            if (on) {
                                set({ intercourse: { isProtected: isProtected } });
                            } else {
                                set({ intercourse: null });
                            }
                        }}
                    />
                    {hadIntercourse ? (
                        <ToggleRow
                            title={t("fertility.intercourse.protected")}
                            Icon={ShieldCheck}
                            value={isProtected}
                            onChange={(protected_) => set({ intercourse: { isProtected: protected_ } })}
                        />
                    ) : null}
                </>
            ) : null}

            <View style={screenStyles.footer}>
                <PrimaryButton label={tCommon("action.continue")} onPress={onContinue} />
                <CheckinSaveButton onSaved={onSaved} />
            </View>
        </CheckinScreen>
    );
}
