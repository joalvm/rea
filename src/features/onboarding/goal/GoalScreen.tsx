import { useTranslation } from "react-i18next";

import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Onboarding: ¿busca embarazo? (trying_to_conceive). Oculto si usa anticoncepción hormonal. Ver README. */
export default function GoalScreen({ onContinue }: Props) {
    const { t } = useTranslation("onboarding");
    return (
        <Placeholder
            phase="MVP"
            title={t("goal.title")}
            routePath="(onboarding)/goal.tsx"
            description={t("goal.body")}
            primaryLabel={t("actions.continue")}
            onPrimary={onContinue}
        />
    );
}
