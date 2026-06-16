import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

type Props = {
    onContinue: () => void;
};

/** Onboarding: ventana e intervalo de recordatorios (user_profile.reminder_*). Ver README. */
export default function Notifications({ onContinue }: Props) {
    return (
        <ScreenPlaceholder
            phase="MVP"
            title="Recordatorios"
            routePath="(onboarding)/notifications.tsx"
            description="¿De qué hora a qué hora y cada cuánto te preguntamos cómo vas? Por defecto 09:00–22:00 cada 6h. Puedes ignorarlos."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
