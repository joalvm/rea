import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
    onBack: () => void;
};

/** Onboarding (alternativo): importar copia de seguridad y validar datos. Ver README. */
export default function Import({ onContinue, onBack }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="Importar mis datos"
            routePath="(onboarding)/import.tsx"
            description="Restaura una copia de seguridad previa y valida hasta qué fecha hay datos antes de continuar."
            primaryLabel="Continuar"
            onPrimary={onContinue}
            secondaryLabel="Volver"
            onSecondary={onBack}
        />
    );
}
