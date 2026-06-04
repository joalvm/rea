import type { UseAppBackupControllerResult } from "../hooks/useAppBackupController";
import type { UseAppBootstrapControllerResult } from "../hooks/useAppBootstrapController";
import type { UseAppPersistenceControllerResult } from "../hooks/useAppPersistenceController";
import type { UseAppShellStateResult } from "../hooks/useAppShellState";
import { CheckInModal } from "../../features/check-in/CheckInModal";
import { ScheduleModal } from "../../features/settings/ScheduleModal";
import { SettingsModal } from "../../features/settings/SettingsModal";

interface AppShellModalsProps {
    bootstrap: UseAppBootstrapControllerResult;
    backup: UseAppBackupControllerResult;
    persistence: UseAppPersistenceControllerResult;
    shellState: UseAppShellStateResult;
}

/** Renderiza modales raíz del shell usando contratos reales de estado y acciones. */
export default function AppShellModals({ bootstrap, backup, persistence, shellState }: AppShellModalsProps) {
    const closeSettings = () => {
        backup.dismissExportSavedNotice();
        shellState.closeSettings();
    };

    return (
        <>
            <CheckInModal
                key={shellState.checkIn.sessionKey}
                initialCheckIn={shellState.checkIn.initialCheckIn}
                initialDailyLog={shellState.checkIn.initialDailyLog}
                mode={shellState.checkIn.mode}
                momentType={shellState.checkIn.momentType}
                onClose={shellState.closeCheckIn}
                onDelete={persistence.deleteCheckIn}
                onSave={persistence.saveCheckIn}
                dailyLogOnly={shellState.checkIn.dailyLogOnly}
                promptContext={shellState.checkIn.promptContext}
                visible={shellState.checkIn.visible}
            />
            <ScheduleModal
                cadence={bootstrap.notificationCadence}
                onChange={persistence.saveNotificationCadence}
                onClose={shellState.closeSchedule}
                visible={shellState.scheduleVisible}
            />
            <SettingsModal
                exportSavedNotice={backup.exportSavedNotice}
                exportingBackup={backup.exportingBackup}
                importingBackup={backup.importingBackup}
                notificationCadence={bootstrap.notificationCadence}
                onClose={closeSettings}
                onDismissExportSavedNotice={backup.dismissExportSavedNotice}
                onExportBackup={backup.exportBackup}
                onGenerateDevelopmentData={persistence.seedDevelopmentUserData}
                onImportBackup={backup.importBackup}
                onOpenSchedule={shellState.openScheduleFromSettings}
                onReset={persistence.resetApplication}
                onSaveSettings={persistence.saveAppSettings}
                onShareSavedBackup={backup.shareSavedBackup}
                settings={bootstrap.settings}
                visible={shellState.settingsVisible}
            />
        </>
    );
}
