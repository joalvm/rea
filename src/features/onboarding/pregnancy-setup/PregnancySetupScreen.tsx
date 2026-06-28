import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Alert, View } from "react-native";

import { useTheme } from "@/theme/useTheme";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";
import { buildPregnancyDraftPatch } from "@/features/onboarding/shared/utils/buildPregnancyDraftPatch";
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
    const theme = useTheme();
    const styles = usePregnancySetupStyles();
    const accent = theme.phases.pregnancy.accent;

    const lmp = useOnboardingStore((state) => state.draft.pregnancyLmp);
    const due = useOnboardingStore((state) => state.draft.pregnancyDueDate);
    const set = useOnboardingStore((state) => state.set);

    const [knowDue, setKnowDue] = useState(due !== null);

    const lmpParts: YMD = lmp ? isoToYMD(lmp) : todayYMD();
    const dueParts: YMD = due ? isoToYMD(due) : todayYMD();

    const monthLabels = [
        t("months.jan"),
        t("months.feb"),
        t("months.mar"),
        t("months.apr"),
        t("months.may"),
        t("months.jun"),
        t("months.jul"),
        t("months.aug"),
        t("months.sep"),
        t("months.oct"),
        t("months.nov"),
        t("months.dec"),
    ];

    const minYear = new Date().getFullYear() - 1;
    const maxYear = new Date().getFullYear();

    const submit = () => {
        const result = buildPregnancyDraftPatch(lmpParts, dueParts, knowDue);
        if (!result.isValid) {
            Alert.alert(t("validation.invalidPregnancyDueDate"));
            return;
        }

        set(result.patch);
        onPush("/(onboarding)/notifications");
    };

    return (
        <OnboardingScreen
            progress={0.7}
            step={4}
            total={6}
            accent={accent}
            onBack={onBack}
            cta={{ label: t("cta.continue"), onPress: submit }}
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
                    setKnowDue(value);
                    if (!value) {
                        set({ pregnancyDueDate: null });
                    }
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
