import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

/** Configuración: acerca de Rea + disclaimer. Ver README. */
export default function About() {
    return (
        <ScreenPlaceholder
            phase="MVP"
            title="Acerca de Rea"
            routePath="settings/about.tsx"
            description="Disclaimer (Rea no diagnostica ni es método anticonceptivo), versión de la app y enfoque de privacidad."
        />
    );
}
