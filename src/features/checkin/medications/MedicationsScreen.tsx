import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 6: medicamentos tomados → checkin_medications. Ver README. */
export default function MedicationsScreen({ onContinue }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="Medicamentos"
            routePath="checkin/medications.tsx"
            description="Qué tomaste (catálogo personal) + nota de dosis. El alivio (0-2) es opcional: se puede completar después."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
