import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/**
 * Check-in paso 5 (CONDICIONAL): fertilidad y sexualidad.
 * Solo si trying_to_conceive y sin anticoncepción hormonal. Ver README.
 */
export default function FertilityScreen({ onContinue }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="Fertilidad"
            routePath="checkin/fertility.tsx"
            description="Moco cervical (0-4), libido (0-4) y registrar relación (intercourse_log). Copy de señales, nunca de certeza."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
