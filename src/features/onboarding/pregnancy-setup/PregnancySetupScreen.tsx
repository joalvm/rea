import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";

import { getMonthLabels } from "@/modules/l10n/getMonthLabels";
import { useTheme } from "@/theme/useTheme";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";
import { estimateDueDate } from "@/features/onboarding/pregnancy-setup/utils/estimateDueDate";
import { pregnancySchema } from "@/features/onboarding/pregnancy-setup/schemas/pregnancySchema";
import { type YMD, isoToYMD, todayYMD, ymdToISO } from "@/features/onboarding/shared/utils/onboardingDate";

import { DateWheel } from "../shared/components/date-wheel/DateWheel";
import { FieldLabel } from "../shared/components/field-label/FieldLabel";
import { HelpText } from "../shared/components/help-text/HelpText";
import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ScreenLead } from "../shared/components/screen-lead/ScreenLead";
import { ScreenTitle } from "../shared/components/screen-title/ScreenTitle";
import { ToggleRow } from "../shared/components/toggle-row/ToggleRow";
import { usePregnancySetupStyles } from "./PregnancySetupStyle";

type Props = {
    onBack: () => void;
    onPush: (href: string) => void;
};

/** Paso (solo pregnancy): FUM + fecha probable de parto opcional. Tono teal. */
export default function PregnancySetupScreen({ onBack, onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const { t: tCommon } = useTranslation("common");
    const { t: tValidation } = useTranslation("validation");
    const theme = useTheme();
    const styles = usePregnancySetupStyles();
    const accent = theme.phases.pregnancy.accent;

    const lmp = useOnboardingStore((state) => state.draft.pregnancyLmp);
    const due = useOnboardingStore((state) => state.draft.pregnancyDueDate);
    const set = useOnboardingStore((state) => state.set);

    const lmpParts: YMD = lmp ? isoToYMD(lmp) : todayYMD();
    const knowDue = due !== null;
    const fallbackDueDate = estimateDueDate(lmpParts);
    const dueParts: YMD = due ? isoToYMD(due) : isoToYMD(fallbackDueDate);

    const monthLabels = getMonthLabels();

    const minYear = new Date().getFullYear() - 1;
    const maxYear = new Date().getFullYear();

    const submit = () => {
        const result = pregnancySchema.safeParse({
            pregnancyDueDate: knowDue ? ymdToISO(dueParts) : null,
            pregnancyLmp: ymdToISO(lmpParts),
        });

        if (!result.success) {
            Alert.alert(tValidation("onboarding.invalidPregnancyDueDate"));
            return;
        }

        set(result.data);
        onPush("/(onboarding)/notifications");
    };

    return (
        <OnboardingScreen
            progress={0.7}
            step={4}
            total={6}
            accent={accent}
            onBack={onBack}
            cta={{ label: tCommon("action.continue"), onPress: submit }}
        >
            <View style={styles.header}>
                <ScreenTitle accent={accent}>{t("pregnancySetup.title")}</ScreenTitle>
                <ScreenLead>{t("pregnancySetup.lead")}</ScreenLead>
            </View>

            <View style={styles.fieldGroup}>
                <FieldLabel>{t("pregnancySetup.lmpLabel")}</FieldLabel>
                <DateWheel
                    value={lmpParts}
                    monthLabels={monthLabels}
                    minYear={minYear}
                    maxYear={maxYear}
                    onChange={(value) => set({ pregnancyLmp: ymdToISO(value) })}
                    testID="pregnancy-lmp"
                />
            </View>

            <ToggleRow
                title={t("pregnancySetup.dueToggleTitle")}
                value={knowDue}
                accent={accent}
                onChange={(value) => {
                    if (!value) {
                        set({ pregnancyDueDate: null });
                        return;
                    }

                    set({ pregnancyDueDate: due ?? fallbackDueDate });
                }}
                testID="pregnancy-due-toggle"
            />

            {knowDue ? (
                <View style={styles.fieldGroup}>
                    <FieldLabel>{t("pregnancySetup.dueLabel")}</FieldLabel>
                    <DateWheel
                        value={dueParts}
                        monthLabels={monthLabels}
                        minYear={minYear}
                        maxYear={maxYear + 1}
                        onChange={(value) => set({ pregnancyDueDate: ymdToISO(value) })}
                        testID="pregnancy-due"
                    />
                </View>
            ) : null}

            <HelpText>{t("pregnancySetup.help")}</HelpText>
        </OnboardingScreen>
    );
}
