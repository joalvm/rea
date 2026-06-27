import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 2: estado emocional. Ver README. */
export default function FeelingsScreen({ onContinue }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="¿Cómo estás de ánimo?"
            routePath="checkin/feelings.tsx"
            description="Ánimo (1-5), energía (1-5) y estrés (0-5). Escalas suaves, no examen clínico."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
