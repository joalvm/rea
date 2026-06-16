import Placeholder from "@/components/placeholder/Placeholder";

/** Configuración: centro de privacidad (export/import/borrar/bloqueo). Ver README. */
export default function Privacy() {
    return (
        <Placeholder
            phase="P3"
            title="Privacidad"
            routePath="settings/privacy.tsx"
            description="Exportar / importar / borrar todos los datos y bloqueo con PIN o biometría. Rea es local-first: nada sale del dispositivo."
        />
    );
}
