import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

/** Configuración: modo embarazo (pregnancy_episodes). Pausa predicciones. Ver README. */
export default function Pregnancy() {
    return (
        <ScreenPlaceholder
            phase="MVP"
            title="Modo embarazo"
            routePath="settings/pregnancy.tsx"
            description="Registrar inicio/fin de un embarazo (pregnancy_episodes). Rea pausa las predicciones de ciclo; el diario sigue disponible."
        />
    );
}
