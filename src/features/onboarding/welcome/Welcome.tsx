import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

type Props = {
    onStart: () => void;
    onImport: () => void;
};

/** Paso 1 del onboarding: bienvenida + promesa de privacidad. Ver README de la feature. */
export default function Welcome({ onStart, onImport }: Props) {
    return (
        <ScreenPlaceholder
            phase="MVP"
            title="Bienvenida a Rea"
            routePath="(onboarding)/welcome.tsx"
            description="Promesa de privacidad: tus datos viven en tu dispositivo, puedes exportarlos y borrarlos. Rea no diagnostica."
            primaryLabel="Empezar"
            onPrimary={onStart}
            secondaryLabel="Ya tengo una copia de seguridad"
            onSecondary={onImport}
        />
    );
}
