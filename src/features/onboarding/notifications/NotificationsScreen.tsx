import { useTranslation } from "react-i18next";

import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Onboarding: ventana e intervalo de recordatorios (user_profile.reminder_*). Ver README. */
export default function NotificationsScreen({ onContinue }: Props) {
    const { t } = useTranslation("onboarding");
    return (
        <Placeholder
            phase="MVP"
            title={t("notifications.title")}
            routePath="(onboarding)/notifications.tsx"
            description={t("notifications.body")}
            primaryLabel={t("actions.continue")}
            onPrimary={onContinue}
        />
    );
}
