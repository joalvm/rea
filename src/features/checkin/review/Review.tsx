import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

type Props = {
    onSave: () => void;
};

/**
 * Check-in paso final: resumen y guardado.
 * Al guardar persiste el check-in (+ síntomas, medicación, relación) y dispara
 * el recálculo de daily_summary del día. Ver README de la feature.
 */
export default function Review({ onSave }: Props) {
    return (
        <ScreenPlaceholder
            phase="MVP"
            title="Revisa tu registro"
            routePath="checkin/review.tsx"
            description="Resumen de sangrado, estado, síntomas, medicación y nota. Al guardar, Rea recalcula el resumen del día."
            primaryLabel="Guardar mi registro"
            onPrimary={onSave}
        />
    );
}
