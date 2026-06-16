import ScreenPlaceholder, { type PlaceholderLink } from "@/components/screen-placeholder/ScreenPlaceholder";

type Props = {
    links: PlaceholderLink[];
};

/** Tab Configuración: índice que abre cada pantalla de ajustes. Ver README de la feature. */
export default function Settings({ links }: Props) {
    return (
        <ScreenPlaceholder
            phase="MVP"
            title="Configuración"
            routePath="(tabs)/settings.tsx"
            description="Índice de ajustes. Cada opción abre su pantalla."
            links={links}
        />
    );
}
