import Placeholder from "@/components/placeholder/Placeholder";

/** Configuración: catálogo personal de medicamentos (medication_catalog). Ver README. */
export default function MedicationsManagerScreen() {
    return (
        <Placeholder
            phase="MVP"
            title="Mis medicamentos"
            routePath="settings/medications.tsx"
            description="Añadir, renombrar o archivar medicamentos del catálogo personal. normalized_name evita duplicados."
        />
    );
}
