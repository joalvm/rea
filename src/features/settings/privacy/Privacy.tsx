import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

/** Configuración: centro de privacidad (export/import/borrar/bloqueo). Ver README. */
export default function Privacy() {
    return (
        <ScreenPlaceholder
            phase="P3"
            title="Privacidad"
            routePath="settings/privacy.tsx"
            description="Exportar / importar / borrar todos los datos y bloqueo con PIN o biometría. Rea es local-first: nada sale del dispositivo."
        />
    );
}
