import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

/** Edición de un periodo (period_runs): fechas, excluir, marcar spotting. Ver README. */
export default function PeriodEdit() {
    return (
        <ScreenPlaceholder
            phase="P2"
            title="Editar periodo"
            routePath="period/edit.tsx"
            description="Cambiar fecha de inicio/fin, marcar como manchado (no periodo) o excluir el episodio. Usa status y source de period_runs."
        />
    );
}
