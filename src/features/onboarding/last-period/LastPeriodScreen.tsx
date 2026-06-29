import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";
import { buildLastPeriodDraftPatch } from "@/features/onboarding/shared/utils/buildLastPeriodDraftPatch";
import { type YMD, isoToYMD, todayYMD, ymdToISO } from "@/features/onboarding/shared/utils/onboardingDate";

import { DateWheel } from "../shared/components/date-wheel/DateWheel";
import { FieldLabel } from "../shared/components/field-label/FieldLabel";
import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ScreenLead } from "../shared/components/screen-lead/ScreenLead";
import { ScreenTitle } from "../shared/components/screen-title/ScreenTitle";
import { ToggleRow } from "../shared/components/toggle-row/ToggleRow";
import { useLastPeriodStyles } from "./LastPeriodStyle";

type Props = {
    onBack: () => void;
    onPush: (href: string) => void;
};

/** Paso 4: inicio del último periodo (modos de seguimiento de ciclo) + toggle "aún continúa". */
export default function LastPeriodScreen({ onBack, onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const styles = useLastPeriodStyles();
    const draft = useOnboardingStore((state) => state.draft);
    const set = useOnboardingStore((state) => state.set);

    const start: YMD = draft.lastPeriodStart ? isoToYMD(draft.lastPeriodStart) : todayYMD();
    const end: YMD = draft.lastPeriodEnd ? isoToYMD(draft.lastPeriodEnd) : todayYMD();

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

    const submit = () => {
        const result = buildLastPeriodDraftPatch(start, end, draft.lastPeriodOngoing);
        if (!result.isValid) {
            Alert.alert(t("validation.invalidLastPeriodRange"));
            return;
        }

        set(result.patch);
        onPush("/(onboarding)/cycle");
    };

    return (
        <OnboardingScreen
            progress={0.45}
            step={4}
            total={10}
            onBack={onBack}
            cta={{ label: t("cta.continue"), onPress: submit }}
        >
            <View style={styles.header}>
                <ScreenTitle>{t("lastPeriod.title")}</ScreenTitle>
                <ScreenLead>{t("lastPeriod.lead")}</ScreenLead>
            </View>

            <DateWheel
                value={start}
                monthLabels={monthLabels}
                minYear={new Date().getFullYear() - 5}
                maxYear={new Date().getFullYear()}
                onChange={(value) => set({ lastPeriodStart: ymdToISO(value) })}
                testID="last-period-start"
            />

            {!draft.lastPeriodOngoing ? (
                <View style={styles.fieldGroup}>
                    <FieldLabel>{t("lastPeriod.ongoingTitle")}</FieldLabel>
                    <DateWheel
                        value={end}
                        monthLabels={monthLabels}
                        minYear={new Date().getFullYear() - 5}
                        maxYear={new Date().getFullYear()}
                        onChange={(value) => set({ lastPeriodEnd: ymdToISO(value) })}
                        testID="last-period-end"
                    />
                </View>
            ) : null}

            <ToggleRow
                title={t("lastPeriod.ongoingTitle")}
                subtitle={t("lastPeriod.ongoingSubtitle")}
                value={draft.lastPeriodOngoing}
                onChange={(value) => set({ lastPeriodOngoing: value })}
                testID="last-period-ongoing"
            />
        </OnboardingScreen>
    );
}
