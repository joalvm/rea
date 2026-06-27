import Placeholder from "@/components/placeholder/Placeholder";

/** Confirmación de periodo inferido por sangrado (source bleeding_inferred). Ver README. */
export default function PeriodConfirmScreen() {
    return (
        <Placeholder
            phase="P2"
            title="¿Fue tu periodo?"
            routePath="period/confirm.tsx"
            description="Rea detectó sangrado varios días. Confirmar como periodo (source → user_confirmed), marcar como manchado o no contar."
        />
    );
}
