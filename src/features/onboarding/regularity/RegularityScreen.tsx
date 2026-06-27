import { useTranslation } from "react-i18next";

import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Onboarding: regularidad percibida (regular | variable | irregular). Ver README. */
export default function RegularityScreen({ onContinue }: Props) {
    const { t } = useTranslation("onboarding");
    return (
        <Placeholder
            phase="MVP"
            title={t("regularity.title")}
            routePath="(onboarding)/regularity.tsx"
            description={t("regularity.body")}
            primaryLabel={t("actions.continue")}
            onPrimary={onContinue}
        />
    );
}
