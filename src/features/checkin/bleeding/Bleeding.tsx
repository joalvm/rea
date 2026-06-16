import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 1: sangrado y periodo. Puede crear/actualizar period_runs. Ver README. */
export default function Bleeding({ onContinue }: Props) {
    return (
        <ScreenPlaceholder
            phase="MVP"
            title="Sangrado"
            routePath="checkin/bleeding.tsx"
            description="Intensidad (0-4), coágulos (0-3) y señal de periodo (empezó · sigue · terminó). Alimenta checkins y period_runs."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
