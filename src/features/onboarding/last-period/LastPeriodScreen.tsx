import { Droplet } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { getMonthLabels } from "@/modules/l10n/getMonthLabels";
import { useOnboardingStore } from "../shared/stores/useOnboardingStore";
import { lastPeriodSchema } from "./schemas/lastPeriodSchema";
import { type YMD, isoToYMD, todayYMD, ymdToISO } from "../shared/utils/onboardingDate";

import { DateWheel } from "../shared/components/date-wheel/DateWheel";
import { FieldLabel } from "../shared/components/field-label/FieldLabel";
import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ScreenHeader } from "../shared/components/screen-header/ScreenHeader";
import { ToggleRow } from "../shared/components/toggle-row/ToggleRow";
import { useLastPeriodStyles } from "./LastPeriodStyle";

type Props = {
    onPush: (href: string) => void;
};

/** Paso 6: inicio del último periodo (modos de seguimiento de ciclo) + toggle "aún continúa". */
export default function LastPeriodScreen({ onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const { t: tCommon } = useTranslation("common");
    const { t: tValidation } = useTranslation("validation");
    const styles = useLastPeriodStyles();
    const draft = useOnboardingStore((state) => state.draft);
    const intent = useOnboardingStore((state) => state.draft.intent);
    const set = useOnboardingStore((state) => state.set);

    const today = todayYMD();
    const start: YMD = draft.lastPeriodStart ? isoToYMD(draft.lastPeriodStart) : today;
    const end: YMD = draft.lastPeriodEnd ? isoToYMD(draft.lastPeriodEnd) : today;

    const monthLabels = getMonthLabels();

    const submit = () => {
        const result = lastPeriodSchema.safeParse({
            lastPeriodEnd: draft.lastPeriodOngoing ? null : ymdToISO(end),
            lastPeriodOngoing: draft.lastPeriodOngoing,
            lastPeriodStart: ymdToISO(start),
        });

        if (!result.success) {
            const code = result.error.issues[0]?.message;
            const messageKey =
                code === "startInFuture" || code === "endInFuture"
                    ? "onboarding.invalidLastPeriodFuture"
                    : "onboarding.invalidLastPeriodRange";
            Alert.alert(tValidation(messageKey));
            return;
        }

        set(result.data);

        if (!intent) {
            onPush("/(onboarding)/intent");
            return;
        }

        // TTC guarda "none" sin preguntar (excluyente con hormonal); los demás
        // modos de ciclo sí declaran su método anticonceptivo.
        onPush(
            intent.reproductiveMode === "tracking_ttc" ? "/(onboarding)/notifications" : "/(onboarding)/contraception",
        );
    };

    return (
        <OnboardingScreen step={6} total={9} cta={{ label: tCommon("action.continue"), onPress: submit }}>
            <ScreenHeader Icon={Droplet} title={t("lastPeriod.title")} lead={t("lastPeriod.lead")} />

            <DateWheel
                value={start}
                monthLabels={monthLabels}
                minYear={today.year - 5}
                maxYear={today.year}
                max={today}
                onChange={(value) => set({ lastPeriodStart: ymdToISO(value) })}
                testID="last-period-start"
            />

            <ToggleRow
                title={t("lastPeriod.ongoingTitle")}
                subtitle={t("lastPeriod.ongoingSubtitle")}
                value={draft.lastPeriodOngoing}
                onChange={(value) => set({ lastPeriodOngoing: value })}
                testID="last-period-ongoing"
            />

            {!draft.lastPeriodOngoing ? (
                <View style={styles.fieldGroup}>
                    <FieldLabel>{t("lastPeriod.endDateTitle")}</FieldLabel>
                    <DateWheel
                        value={end}
                        monthLabels={monthLabels}
                        minYear={today.year - 5}
                        maxYear={today.year}
                        max={today}
                        onChange={(value) => set({ lastPeriodEnd: ymdToISO(value) })}
                        testID="last-period-end"
                    />
                </View>
            ) : null}
        </OnboardingScreen>
    );
}
