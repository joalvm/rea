import { useTranslation } from "react-i18next";

import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Onboarding: inicio (y fin opcional) del último periodo → crea el primer period_run. Ver README. */
export default function LastPeriodScreen({ onContinue }: Props) {
    const { t } = useTranslation("onboarding");
    return (
        <Placeholder
            phase="MVP"
            title={t("lastPeriod.title")}
            routePath="(onboarding)/last-period.tsx"
            description={t("lastPeriod.body")}
            primaryLabel={t("actions.continue")}
            onPrimary={onContinue}
        />
    );
}
