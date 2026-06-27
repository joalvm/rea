import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 1: sangrado y periodo. Puede crear/actualizar period_runs. Ver README. */
export default function BleedingScreen({ onContinue }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="Sangrado"
            routePath="checkin/bleeding.tsx"
            description="Intensidad (0-4), coágulos (0-3) y señal de periodo (empezó · sigue · terminó). Alimenta checkins y period_runs."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
