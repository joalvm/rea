import Placeholder from "@/components/placeholder/Placeholder";

/** Edición de un periodo (period_runs): fechas, excluir, marcar spotting. Ver README. */
export default function PeriodEditScreen() {
    return (
        <Placeholder
            phase="P2"
            title="Editar periodo"
            routePath="period/edit.tsx"
            description="Cambiar fecha de inicio/fin, marcar como manchado (no periodo) o excluir el episodio. Usa status y source de period_runs."
        />
    );
}
