import { useTranslation } from "react-i18next";

import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Onboarding: año de nacimiento (user_profile.birth_year). Solo el año. Ver README. */
export default function BirthYearScreen({ onContinue }: Props) {
    const { t } = useTranslation("onboarding");
    return (
        <Placeholder
            phase="MVP"
            title={t("birthYear.title")}
            routePath="(onboarding)/birth-year.tsx"
            description={t("birthYear.body")}
            primaryLabel={t("actions.continue")}
            onPrimary={onContinue}
        />
    );
}
