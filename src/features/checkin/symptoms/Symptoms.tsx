import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 4: síntomas del catálogo con intensidad → checkin_symptoms. Ver README. */
export default function Symptoms({ onContinue }: Props) {
    return (
        <ScreenPlaceholder
            phase="MVP"
            title="Síntomas"
            routePath="checkin/symptoms.tsx"
            description="Catálogo agrupado; primero los de acceso rápido. Al elegir uno, se pide su intensidad (1-5)."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
