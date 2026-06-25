import { useTranslation } from "react-i18next";

import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
    onBack: () => void;
};

/** Onboarding (alternativo): importar copia de seguridad y validar datos. Ver README. */
export default function Import({ onContinue, onBack }: Props) {
    const { t } = useTranslation("onboarding");
    return (
        <Placeholder
            phase="MVP"
            title={t("import.title")}
            routePath="(onboarding)/import.tsx"
            description={t("import.body")}
            primaryLabel={t("actions.continue")}
            onPrimary={onContinue}
            secondaryLabel={t("actions.back")}
            onSecondary={onBack}
        />
    );
}
