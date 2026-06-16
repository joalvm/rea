import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

/** Tab Estadísticas (segmentada): resumen del ciclo, fases, síntomas, etc. Ver README. */
export default function Statistics() {
    return (
        <ScreenPlaceholder
            phase="P2"
            title="Estadísticas"
            routePath="(tabs)/stats.tsx"
            description="Segmentada: Ciclo · Fases · Síntomas · Ánimo/energía/estrés · Medicación · Señales para consultar. Insights honestos, no gráficos por gráficos."
        />
    );
}
