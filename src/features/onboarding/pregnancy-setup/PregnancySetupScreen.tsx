import { Baby } from "lucide-react-native";
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
import { ScreenHeader } from "../shared/components/screen-header/ScreenHeader";
import { ToggleRow } from "../shared/components/toggle-row/ToggleRow";
import { usePregnancySetupStyles } from "./PregnancySetupStyle";

type Props = {
    onPush: (href: string) => void;
};

/** Paso (solo pregnancy): FUM + fecha probable de parto opcional. Tono teal. */
export default function PregnancySetupScreen({ onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const { t: tCommon } = useTranslation("common");
    const { t: tValidation } = useTranslation("validation");
    const theme = useTheme();
    const styles = usePregnancySetupStyles();
    const accent = theme.phases.pregnancy.accent;

    const lmp = useOnboardingStore((state) => state.draft.pregnancyLmp);
    const due = useOnboardingStore((state) => state.draft.pregnancyDueDate);
    const set = useOnboardingStore((state) => state.set);

    const today = todayYMD();
    const lmpParts: YMD = lmp ? isoToYMD(lmp) : today;
    const knowDue = due !== null;
    const fallbackDueDate = estimateDueDate(lmpParts);
    const dueParts: YMD = due ? isoToYMD(due) : isoToYMD(fallbackDueDate);

    const monthLabels = getMonthLabels();

    const minYear = today.year - 1;
    const maxYear = today.year;

    const submit = () => {
        const result = pregnancySchema.safeParse({
            pregnancyDueDate: knowDue ? ymdToISO(dueParts) : null,
            pregnancyLmp: ymdToISO(lmpParts),
        });

        if (!result.success) {
            const code = result.error.issues[0]?.message;
            const messageKey =
                code === "lmpInFuture" ? "onboarding.invalidPregnancyLmpFuture" : "onboarding.invalidPregnancyDueDate";
            Alert.alert(tValidation(messageKey));
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

            <View style={styles.fieldGroup}>
                <FieldLabel>{t("pregnancySetup.lmpLabel")}</FieldLabel>
                <DateWheel
                    value={lmpParts}
                    monthLabels={monthLabels}
                    minYear={minYear}
                    maxYear={maxYear}
                    max={today}
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
