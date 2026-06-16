import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Onboarding: ventana e intervalo de recordatorios (user_profile.reminder_*). Ver README. */
export default function Notifications({ onContinue }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="Recordatorios"
            routePath="(onboarding)/notifications.tsx"
            description="¿De qué hora a qué hora y cada cuánto te preguntamos cómo vas? Por defecto 09:00–22:00 cada 6h. Puedes ignorarlos."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
