import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useOnboardingStore } from "../shared/stores/useOnboardingStore";
import { profileSchema, DEFAULT_BIRTH_YEAR, MAX_BIRTH_YEAR, MIN_BIRTH_YEAR } from "./schemas/profileSchema";

import { FieldLabel } from "../shared/components/field-label/FieldLabel";
import { HelpText } from "../shared/components/help-text/HelpText";
import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { OutlinedField } from "../shared/components/outlined-field/OutlinedField";
import { ScreenLead } from "../shared/components/screen-lead/ScreenLead";
import { ScreenTitle } from "../shared/components/screen-title/ScreenTitle";
import { WheelPicker } from "../shared/components/wheel-picker/WheelPicker";
import { useProfileStyles } from "./ProfileStyle";

type Props = {
    onBack: () => void;
    onPush: (href: string) => void;
};

const BIRTH_YEAR_OPTIONS = Array.from({ length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 }, (_, index) =>
    String(MIN_BIRTH_YEAR + index),
);

/** Paso 2: nombre + año de nacimiento. Año siempre con valor (rueda); CTA pide nombre. */
export default function ProfileScreen({ onBack, onPush }: Props) {
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
            progress={0.18}
            step={2}
            total={10}
            onBack={onBack}
            cta={{ label: tCommon("action.continue"), onPress: submit, disabled: name.trim().length === 0 }}
        >
            <View style={styles.header}>
                <ScreenTitle>{t("profile.title")}</ScreenTitle>
                <ScreenLead>{t("profile.lead")}</ScreenLead>
            </View>

            <View style={styles.fieldGroup}>
                <FieldLabel>{t("profile.nameLabel")}</FieldLabel>
                <OutlinedField
                    value={name}
                    onChangeText={(value) => set({ name: value })}
                    placeholder={t("profile.namePlaceholder")}
                    testID="profile-name"
                />
            </View>

            <View style={styles.fieldGroup}>
                <FieldLabel>{t("profile.yearLabel")}</FieldLabel>
                <WheelPicker
                    items={BIRTH_YEAR_OPTIONS}
                    valueIndex={yearIndex}
                    onChange={(index) => set({ birthYear: MIN_BIRTH_YEAR + index })}
                    testID="profile-year"
                />
                <HelpText>{t("profile.yearHelp")}</HelpText>
            </View>
        </OnboardingScreen>
    );
}
