import { useTranslation } from "react-i18next";

import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onFinish: () => void;
};

/**
 * Último paso del onboarding: disclaimer + arranque.
 * Persiste perfil + intención reproductiva + primer periodo y sella
 * `user_profile.onboarding_completed_at`. Ver README de la feature.
 */
export default function Complete({ onFinish }: Props) {
    const { t } = useTranslation("onboarding");
    return (
        <Placeholder
            phase="MVP"
            title={t("complete.title")}
            routePath="(onboarding)/complete.tsx"
            description={t("complete.disclaimer")}
            primaryLabel={t("complete.finish")}
            onPrimary={onFinish}
        />
    );
}
