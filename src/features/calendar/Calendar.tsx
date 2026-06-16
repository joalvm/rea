import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

/** Tab Calendario: rejilla mensual desde daily_summary. Ver README de la feature. */
export default function Calendar() {
    return (
        <ScreenPlaceholder
            phase="P2"
            title="Calendario"
            routePath="(tabs)/calendar.tsx"
            description="Rejilla mensual desde daily_summary: color por fase y menstruación, marcadores discretos (medicación, relación, síntoma) y overlay de predicción. Tocar un día abre su detalle."
        />
    );
}
