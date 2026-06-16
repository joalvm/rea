import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Onboarding: duración del sangrado y del ciclo (declared_period_length / declared_cycle_length). Ver README. */
export default function Cycle({ onContinue }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="Duración de tu ciclo"
            routePath="(onboarding)/cycle.tsx"
            description="¿Cuánto dura tu sangrado y cada cuántos días llega? Punto de partida 5/28; se ajusta con tus registros."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
