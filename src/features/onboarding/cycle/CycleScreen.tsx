import { useTranslation } from "react-i18next";

import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Onboarding: duración del sangrado y del ciclo (declared_period_length / declared_cycle_length). Ver README. */
export default function CycleScreen({ onContinue }: Props) {
    const { t } = useTranslation("onboarding");
    return (
        <Placeholder
            phase="MVP"
            title={t("cycle.title")}
            routePath="(onboarding)/cycle.tsx"
            description={t("cycle.body")}
            primaryLabel={t("actions.continue")}
            onPrimary={onContinue}
        />
    );
}
