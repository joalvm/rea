import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 6: medicamentos tomados → checkin_medications. Ver README. */
export default function Medications({ onContinue }: Props) {
    return (
        <ScreenPlaceholder
            phase="MVP"
            title="Medicamentos"
            routePath="checkin/medications.tsx"
            description="Qué tomaste (catálogo personal) + nota de dosis. El alivio (0-2) es opcional: se puede completar después."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
