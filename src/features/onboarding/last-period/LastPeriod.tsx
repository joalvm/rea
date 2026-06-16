import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Onboarding: inicio (y fin opcional) del último periodo → crea el primer period_run. Ver README. */
export default function LastPeriod({ onContinue }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="Tu último periodo"
            routePath="(onboarding)/last-period.tsx"
            description="¿Qué día empezó? ¿Ya terminó? Crea el primer period_run que siembra el motor de estimación."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
