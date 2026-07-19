import { Baby } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";

import { formatDate } from "@/modules/l10n/formatDate";
import { getMonthLabels } from "@/modules/l10n/getMonthLabels";
import { useTheme } from "@/theme/useTheme";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";
import { estimateDueDate, estimateLmpFromDueDate } from "@/features/onboarding/pregnancy-setup/utils/estimateDueDate";
import { pregnancySchema } from "@/features/onboarding/pregnancy-setup/schemas/pregnancySchema";
import { type YMD, isoToYMD, todayYMD, ymdToISO } from "@/shared/utils/ymd";

import { DateWheel } from "@/components/date-wheel/DateWheel";

import { FieldLabel } from "../shared/components/field-label/FieldLabel";
import { HelpText } from "../shared/components/help-text/HelpText";
import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ScreenHeader } from "../shared/components/screen-header/ScreenHeader";
import { SegmentedControl } from "../shared/components/segmented-control/SegmentedControl";
import { usePregnancySetupStyles } from "./PregnancySetupStyle";

type Props = {
    onPush: (href: string) => void;
};

function validationMessageKeyFor(code: string) {
    switch (code) {
        case "lmpInFuture":
            return "onboarding.invalidPregnancyLmpFuture" as const;
        case "lmpTooOld":
            return "onboarding.invalidPregnancyLmpTooOld" as const;
        case "dueDateInPast":
            return "onboarding.invalidPregnancyDueDateInPast" as const;
        case "dueDateTooFar":
            return "onboarding.invalidPregnancyDueDateTooFar" as const;
        default:
            return "onboarding.invalidPregnancyDueDate" as const;
    }
}

/**
 * Paso (solo pregnancy): ancla el embarazo por lo que la usuaria realmente sabe.
 * Pregunta UN dato — FUM o FPP —, nunca ambos; el otro se deriva con la regla de
 * Naegele y queda registrado como derivado (`dating_basis`). Tono teal.
 */
export default function PregnancySetupScreen({ onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const { t: tCommon } = useTranslation("common");
    const { t: tValidation } = useTranslation("validation");
    const theme = useTheme();
    const styles = usePregnancySetupStyles();
    const accent = theme.phases.pregnancy.accent;

    const lmp = useOnboardingStore((state) => state.draft.pregnancyLmp);
    const due = useOnboardingStore((state) => state.draft.pregnancyDueDate);
    const datingBasis = useOnboardingStore((state) => state.draft.pregnancyDatingBasis);
    const set = useOnboardingStore((state) => state.set);

    const today = todayYMD();
    const lmpParts: YMD = lmp ? isoToYMD(lmp) : today;
    const dueParts: YMD = due ? isoToYMD(due) : isoToYMD(estimateDueDate(today));

    const monthLabels = getMonthLabels();

    const submit = () => {
        const result = pregnancySchema.safeParse({
            pregnancyDatingBasis: datingBasis,
            pregnancyLmp: datingBasis === "lmp" ? ymdToISO(lmpParts) : estimateLmpFromDueDate(dueParts),
            pregnancyDueDate: datingBasis === "due_date" ? ymdToISO(dueParts) : estimateDueDate(lmpParts),
        });

        if (!result.success) {
            const code = result.error.issues[0]?.message ?? "";
            Alert.alert(tValidation(validationMessageKeyFor(code)));
            return;
        }

        set(result.data);
        onPush("/(onboarding)/notifications");
    };

    return (
        <OnboardingScreen
            step={4}
            total={9}
            accent={accent}
            cta={{ label: tCommon("action.continue"), onPress: submit }}
        >
            <ScreenHeader
                Icon={Baby}
                title={t("pregnancySetup.title")}
                lead={t("pregnancySetup.lead")}
                accent={accent}
            />

            <SegmentedControl
                options={[
                    { value: "lmp", label: t("pregnancySetup.basis.lmp") },
                    { value: "due_date", label: t("pregnancySetup.basis.dueDate") },
                ]}
                value={datingBasis}
                onChange={(value) => set({ pregnancyDatingBasis: value })}
                testID="onboarding-pregnancy-basis"
            />

            {datingBasis === "lmp" ? (
                <View style={styles.fieldGroup}>
                    <FieldLabel>{t("pregnancySetup.lmpLabel")}</FieldLabel>
                    <DateWheel
                        value={lmpParts}
                        monthLabels={monthLabels}
                        minYear={today.year - 1}
                        maxYear={today.year}
                        max={today}
                        onChange={(value) => set({ pregnancyLmp: ymdToISO(value) })}
                        testID="onboarding-pregnancy-lmp"
                    />
                    <HelpText>
                        {t("pregnancySetup.derivedDueDate", { date: formatDate(estimateDueDate(lmpParts), "long") })}
                    </HelpText>
                </View>
            ) : (
                <View style={styles.fieldGroup}>
                    <FieldLabel>{t("pregnancySetup.dueLabel")}</FieldLabel>
                    <DateWheel
                        value={dueParts}
                        monthLabels={monthLabels}
                        minYear={today.year}
                        maxYear={today.year + 1}
                        onChange={(value) => set({ pregnancyDueDate: ymdToISO(value) })}
                        testID="onboarding-pregnancy-due"
                    />
                    <HelpText>
                        {t("pregnancySetup.derivedLmp", { date: formatDate(estimateLmpFromDueDate(dueParts), "long") })}
                    </HelpText>
                </View>
            )}
        </OnboardingScreen>
    );
}
