import { UserRound } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useOnboardingStore } from "../shared/stores/useOnboardingStore";
import { profileSchema, DEFAULT_BIRTH_YEAR, MAX_BIRTH_YEAR, MIN_BIRTH_YEAR } from "./schemas/profileSchema";

import { WheelGroup } from "@/components/wheel-group/WheelGroup";
import { WheelPicker } from "@/components/wheel-picker/WheelPicker";

import { FieldLabel } from "../shared/components/field-label/FieldLabel";
import { HelpText } from "../shared/components/help-text/HelpText";
import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { OutlinedField } from "../shared/components/outlined-field/OutlinedField";
import { ScreenHeader } from "../shared/components/screen-header/ScreenHeader";
import { useProfileStyles } from "./ProfileStyle";

type Props = {
    onPush: (href: string) => void;
};

const BIRTH_YEAR_OPTIONS = Array.from({ length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 }, (_, index) =>
    String(MIN_BIRTH_YEAR + index),
);

/** Paso 2: nombre + año de nacimiento. Año siempre con valor (rueda); CTA pide nombre. */
export default function ProfileScreen({ onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const { t: tCommon } = useTranslation("common");
    const { t: tValidation } = useTranslation("validation");
    const styles = useProfileStyles();
    const name = useOnboardingStore((state) => state.draft.name);
    const storedYear = useOnboardingStore((state) => state.draft.birthYear);
    const set = useOnboardingStore((state) => state.set);
    const selectedBirthYear = Math.min(MAX_BIRTH_YEAR, Math.max(MIN_BIRTH_YEAR, storedYear ?? DEFAULT_BIRTH_YEAR));
    const yearIndex = selectedBirthYear - MIN_BIRTH_YEAR;

    const submit = () => {
        const result = profileSchema.safeParse({
            birthYear: selectedBirthYear,
            name,
        });

        if (!result.success) {
            Alert.alert(tValidation("onboarding.invalidProfile"));
            return;
        }

        set(result.data);
        onPush("/(onboarding)/intent");
    };

    return (
        <OnboardingScreen
            step={2}
            total={9}
            cta={{ label: tCommon("action.continue"), onPress: submit, disabled: name.trim().length === 0 }}
        >
            <ScreenHeader Icon={UserRound} title={t("profile.title")} lead={t("profile.lead")} />

            <View style={styles.fieldGroup}>
                <FieldLabel>{t("profile.nameLabel")}</FieldLabel>
                <OutlinedField
                    value={name}
                    onChangeText={(value) => set({ name: value })}
                    placeholder={t("profile.namePlaceholder")}
                    accessibilityLabel={t("profile.nameLabel")}
                    testID="onboarding-profile-name"
                />
            </View>

            <View style={styles.fieldGroup}>
                <FieldLabel>{t("profile.yearLabel")}</FieldLabel>
                <WheelGroup>
                    <WheelPicker
                        items={BIRTH_YEAR_OPTIONS}
                        valueIndex={yearIndex}
                        onChange={(index) => set({ birthYear: MIN_BIRTH_YEAR + index })}
                        testID="onboarding-profile-year"
                    />
                </WheelGroup>
                <HelpText>{t("profile.yearHelp")}</HelpText>
            </View>
        </OnboardingScreen>
    );
}
