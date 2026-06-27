import { useTranslation } from "react-i18next";

import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onStart: () => void;
    onImport: () => void;
};

/** Paso 1 del onboarding: bienvenida + promesa de privacidad. Ver README de la feature. */
export default function WelcomeScreen({ onStart, onImport }: Props) {
    const { t } = useTranslation("onboarding");
    return (
        <Placeholder
            phase="MVP"
            title={t("welcome.title")}
            routePath="(onboarding)/welcome.tsx"
            description={t("welcome.body")}
            primaryLabel={t("welcome.start")}
            onPrimary={onStart}
            secondaryLabel={t("welcome.restore")}
            onSecondary={onImport}
        />
    );
}
