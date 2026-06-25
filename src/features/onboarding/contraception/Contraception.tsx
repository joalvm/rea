import { useTranslation } from "react-i18next";

import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Onboarding: anticoncepción hormonal (hormonal_contraception). Condiciona fertilidad/TTC. Ver README. */
export default function Contraception({ onContinue }: Props) {
    const { t } = useTranslation("onboarding");
    return (
        <Placeholder
            phase="MVP"
            title={t("contraception.title")}
            routePath="(onboarding)/contraception.tsx"
            description={t("contraception.body")}
            primaryLabel={t("actions.continue")}
            onPrimary={onContinue}
        />
    );
}
