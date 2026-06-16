import Placeholder from "@/components/placeholder/Placeholder";

/** Configuración: recordatorios (user_profile.reminder_*). Ver README. */
export default function SettingsNotifications() {
    return (
        <Placeholder
            phase="MVP"
            title="Recordatorios"
            routePath="settings/notifications.tsx"
            description="Activar/desactivar, ventana horaria, intervalo y tipo de recordatorio (check-in suave, periodo, medicación pendiente)."
        />
    );
}
