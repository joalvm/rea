import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 4: síntomas del catálogo con intensidad → checkin_symptoms. Ver README. */
export default function SymptomsScreen({ onContinue }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="Síntomas"
            routePath="checkin/symptoms.tsx"
            description="Catálogo agrupado; primero los de acceso rápido. Al elegir uno, se pide su intensidad (1-5)."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
