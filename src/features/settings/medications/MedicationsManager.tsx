import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

/** Configuración: catálogo personal de medicamentos (medication_catalog). Ver README. */
export default function MedicationsManager() {
    return (
        <ScreenPlaceholder
            phase="MVP"
            title="Mis medicamentos"
            routePath="settings/medications.tsx"
            description="Añadir, renombrar o archivar medicamentos del catálogo personal. normalized_name evita duplicados."
        />
    );
}
