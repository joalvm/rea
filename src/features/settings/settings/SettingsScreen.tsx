import Placeholder, { type PlaceholderLink } from "@/components/placeholder/Placeholder";

type Props = {
    links: PlaceholderLink[];
};

/** Tab Configuración: índice que abre cada pantalla de ajustes. Ver README de la feature. */
export default function SettingsScreen({ links }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="Configuración"
            routePath="(tabs)/settings.tsx"
            description="Índice de ajustes. Cada opción abre su pantalla."
            links={links}
        />
    );
}
