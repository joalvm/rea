import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Onboarding: ¿busca embarazo? (trying_to_conceive). Oculto si usa anticoncepción hormonal. Ver README. */
export default function Goal({ onContinue }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="¿Qué buscas en Rea?"
            routePath="(onboarding)/goal.tsx"
            description="Solo seguimiento de ciclo, o también buscar embarazo. Condicional: se omite si usas anticoncepción hormonal."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
