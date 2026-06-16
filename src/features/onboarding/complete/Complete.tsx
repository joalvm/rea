import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onFinish: () => void;
};

/**
 * Último paso del onboarding: disclaimer + arranque.
 * Persiste perfil + intención reproductiva + primer periodo y sella
 * `user_profile.onboarding_completed_at`. Ver README de la feature.
 */
export default function Complete({ onFinish }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="Todo listo"
            routePath="(onboarding)/complete.tsx"
            description="Rea no diagnostica, no garantiza fechas exactas y no es método anticonceptivo. Sus estimaciones se basan en lo que registres."
            primaryLabel="Empezar a usar Rea"
            onPrimary={onFinish}
        />
    );
}
