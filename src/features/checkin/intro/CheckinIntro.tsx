import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

type Props = {
    onContinue: () => void;
};

/** Check-in (entrada): elige modo rápido o completo. Ver README de la feature. */
export default function CheckinIntro({ onContinue }: Props) {
    return (
        <ScreenPlaceholder
            phase="MVP"
            title="¿Cómo te sientes ahora?"
            routePath="checkin/index.tsx"
            description="Modo rápido (lo esencial) o completo. Puedes registrar varios check-ins al día. Toma menos de 1 minuto."
            primaryLabel="Empezar check-in"
            onPrimary={onContinue}
        />
    );
}
