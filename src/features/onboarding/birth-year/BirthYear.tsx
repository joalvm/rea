import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

type Props = {
    onContinue: () => void;
};

/** Onboarding: año de nacimiento (user_profile.birth_year). Solo el año. Ver README. */
export default function BirthYear({ onContinue }: Props) {
    return (
        <ScreenPlaceholder
            phase="MVP"
            title="¿En qué año naciste?"
            routePath="(onboarding)/birth-year.tsx"
            description="Solo el año (user_profile.birth_year). Suficiente para contenido por banda de edad y minimiza el dato sensible."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
