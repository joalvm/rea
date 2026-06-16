import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

/** Configuración: contexto reproductivo versionado (reproductive_intent_history). Ver README. */
export default function CycleProfile() {
    return (
        <ScreenPlaceholder
            phase="MVP"
            title="Mi contexto"
            routePath="settings/cycle-profile.tsx"
            description="Regularidad, duración de ciclo/periodo, anticoncepción y búsqueda de embarazo. Editar crea una NUEVA versión, no sobrescribe."
        />
    );
}
