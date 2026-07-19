import { BellRing } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";
import { INITIAL_ONBOARDING_DRAFT } from "@/features/onboarding/shared/types/OnboardingDraft";
import { hourLabels } from "@/shared/utils/ymd";
import { getReminderHourIndex } from "@/shared/schemas/reminder/getReminderHourIndex";
import { reminderSchema } from "@/shared/schemas/reminder/reminderSchema";

import { ToggleRow } from "@/components/toggle-row/ToggleRow";
import { WheelGroup } from "@/components/wheel-group/WheelGroup";
import { WheelPicker } from "@/components/wheel-picker/WheelPicker";

import { FieldLabel } from "../shared/components/field-label/FieldLabel";
import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { ScreenHeader } from "../shared/components/screen-header/ScreenHeader";
import { SegmentedControl } from "../shared/components/segmented-control/SegmentedControl";
import { useNotificationsStyles } from "./NotificationsStyle";

type Props = {
    onPush: (href: string) => void;
};

const HOURS = hourLabels(0, 23);

/** Paso 9: recordatorios suaves (toggle + ventana horaria + intervalo). */
export default function NotificationsScreen({ onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const { t: tCommon } = useTranslation("common");
    const { t: tValidation } = useTranslation("validation");
    const styles = useNotificationsStyles();
    const draft = useOnboardingStore((state) => state.draft);
    const set = useOnboardingStore((state) => state.set);

    const startHour = getReminderHourIndex(draft.reminderWindowStart, INITIAL_ONBOARDING_DRAFT.reminderWindowStart);
    const endHour = getReminderHourIndex(draft.reminderWindowEnd, INITIAL_ONBOARDING_DRAFT.reminderWindowEnd);

    const submit = () => {
        const result = reminderSchema.safeParse(draft);

        if (!result.success) {
            const firstIssue = result.error.issues[0];
            const field = firstIssue?.path[0];

            if (firstIssue?.message === "endBeforeStart") {
                Alert.alert(tValidation("onboarding.invalidReminderWindowRange"));
                return;
            }

            if (field === "reminderIntervalHours") {
                Alert.alert(tValidation("onboarding.invalidReminderInterval"));
                return;
            }

            Alert.alert(tValidation("onboarding.invalidReminderTime"));
            return;
        }

        onPush("/(onboarding)/complete");
    };

    return (
        <OnboardingScreen
            step={8}
            total={9}
            cta={{ label: tCommon("action.continue"), onPress: submit }}
            secondaryCta={{ label: tCommon("action.notNow"), onPress: submit }}
        >
            <ScreenHeader Icon={BellRing} title={t("notifications.title")} lead={t("notifications.lead")} />

            <ToggleRow
                title={t("notifications.enableTitle")}
                subtitle={t("notifications.enableSubtitle")}
                value={draft.remindersEnabled}
                onChange={(value) => set({ remindersEnabled: value })}
                testID="onboarding-notifications-enable"
            />

            {draft.remindersEnabled ? (
                <>
                    <View style={styles.fieldGroup}>
                        <FieldLabel>{t("notifications.windowLabel")}</FieldLabel>
                        <WheelGroup>
                            <View style={styles.timeColumn}>
                                <WheelPicker
                                    items={HOURS}
                                    valueIndex={startHour}
                                    onChange={(index) =>
                                        set({ reminderWindowStart: `${String(index).padStart(2, "0")}:00` })
                                    }
                                    testID="onboarding-notifications-window-start"
                                />
                            </View>
                            <View style={styles.timeColumn}>
                                <WheelPicker
                                    items={HOURS}
                                    valueIndex={endHour}
                                    onChange={(index) =>
                                        set({ reminderWindowEnd: `${String(index).padStart(2, "0")}:00` })
                                    }
                                    testID="onboarding-notifications-window-end"
                                />
                            </View>
                        </WheelGroup>
                    </View>

                    <View style={styles.fieldGroup}>
                        <FieldLabel>{t("notifications.intervalLabel")}</FieldLabel>
                        <SegmentedControl
                            options={[
                                { value: 3, label: t("notifications.interval3h") },
                                { value: 6, label: t("notifications.interval6h") },
                                { value: 12, label: t("notifications.interval12h") },
                            ]}
                            value={draft.reminderIntervalHours}
                            onChange={(value) => set({ reminderIntervalHours: value })}
                            testID="onboarding-notifications-interval"
                        />
                    </View>
                </>
            ) : null}
        </OnboardingScreen>
    );
}
