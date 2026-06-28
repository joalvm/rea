import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { useOnboardingStore } from "@/features/onboarding/shared/stores/useOnboardingStore";

import { FieldLabel } from "../shared/components/field-label/FieldLabel";
import { HelpText } from "../shared/components/help-text/HelpText";
import { OnboardingScreen } from "../shared/components/onboarding-screen/OnboardingScreen";
import { OutlinedField } from "../shared/components/outlined-field/OutlinedField";
import { ScreenLead } from "../shared/components/screen-lead/ScreenLead";
import { ScreenTitle } from "../shared/components/screen-title/ScreenTitle";
import { WheelPicker } from "../shared/components/wheel-picker/WheelPicker";
import { useProfileStyles } from "./ProfileStyle";

const MIN_YEAR = 1925;
const MAX_YEAR = new Date().getFullYear();

type Props = {
    onBack: () => void;
    onPush: (href: string) => void;
};

/** Paso 2: nombre + año de nacimiento. Año siempre con valor (rueda); CTA pide nombre. */
export default function ProfileScreen({ onBack, onPush }: Props) {
    const { t } = useTranslation("onboarding");
    const styles = useProfileStyles();
    const name = useOnboardingStore((state) => state.draft.name);
    const storedYear = useOnboardingStore((state) => state.draft.birthYear);
    const set = useOnboardingStore((state) => state.set);

    const years = useMemo(() => {
        const items: string[] = [];
        for (let year = MIN_YEAR; year <= MAX_YEAR; year += 1) {
            items.push(String(year));
        }
        return items;
    }, []);

    const defaultIndex = Math.min(years.length - 1, Math.max(0, (storedYear ?? MAX_YEAR - 30) - MIN_YEAR));
    const [yearIndex, setYearIndex] = useState(defaultIndex);

    const submit = () => {
        set({ name: name.trim(), birthYear: MIN_YEAR + yearIndex });
        onPush("/(onboarding)/intent");
    };

    return (
        <OnboardingScreen
            progress={0.18}
            step={2}
            total={10}
            onBack={onBack}
            cta={{ label: t("cta.continue"), onPress: submit, disabled: name.trim().length === 0 }}
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
                <WheelPicker items={years} valueIndex={yearIndex} onChange={setYearIndex} testID="profile-year" />
                <HelpText>{t("profile.yearHelp")}</HelpText>
            </View>
        </OnboardingScreen>
    );
}
