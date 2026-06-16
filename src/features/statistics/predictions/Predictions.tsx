import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

/** Segmento de Estadísticas: predicciones con confianza. Ver README de la feature. */
export default function Predictions() {
    return (
        <ScreenPlaceholder
            phase="P2"
            title="Predicciones"
            routePath="features/statistics/predictions"
            description="Próxima regla y ventana fértil/ovulación con nivel de confianza y disclaimer. Vive como segmento dentro de Estadísticas."
        />
    );
}
