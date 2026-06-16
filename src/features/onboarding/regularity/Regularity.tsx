import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Onboarding: regularidad percibida (regular | variable | irregular). Ver README. */
export default function Regularity({ onContinue }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="¿Cómo de regular es?"
            routePath="(onboarding)/regularity.tsx"
            description="Casi siempre parecido (regular) · A veces cambia (variable) · Cambia bastante (irregular)."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
