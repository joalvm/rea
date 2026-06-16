import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

/** Confirmación de periodo inferido por sangrado (source bleeding_inferred). Ver README. */
export default function PeriodConfirm() {
    return (
        <ScreenPlaceholder
            phase="P2"
            title="¿Fue tu periodo?"
            routePath="period/confirm.tsx"
            description="Rea detectó sangrado varios días. Confirmar como periodo (source → user_confirmed), marcar como manchado o no contar."
        />
    );
}
