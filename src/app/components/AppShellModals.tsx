import type { UseAppBackupControllerResult } from "../hooks/useAppBackupController";
import type { UseAppDataControllerResult } from "../hooks/useAppDataController";
import type { UseAppPersistenceControllerResult } from "../hooks/useAppPersistenceController";
import type { UseAppShellStateResult } from "../hooks/useAppShellState";
import { CheckInModal } from "../../features/check-in/CheckInModal";
import { ScheduleModal } from "../../features/settings/ScheduleModal";
import { SettingsModal } from "../../features/settings/SettingsModal";

interface AppShellModalsProps {
    appData: UseAppDataControllerResult;
    backup: UseAppBackupControllerResult;
    persistence: UseAppPersistenceControllerResult;
    shellState: UseAppShellStateResult;
}

/** Renderiza modales raíz del shell usando contratos reales de estado y acciones. */
export default function AppShellModals({ appData, backup, persistence, shellState }: AppShellModalsProps) {
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
                question={shellState.checkIn.question}
                saveTarget={shellState.checkIn.saveTarget}
                visible={shellState.checkIn.visible}
            />
            <ScheduleModal
                moments={appData.moments}
                onChange={persistence.saveMoments}
                onClose={shellState.closeSchedule}
                visible={shellState.scheduleVisible}
            />
            <SettingsModal
                exportSavedNotice={backup.exportSavedNotice}
                exportingBackup={backup.exportingBackup}
                importingBackup={backup.importingBackup}
                moments={appData.moments}
                onClose={closeSettings}
                onDismissExportSavedNotice={backup.dismissExportSavedNotice}
                onExportBackup={backup.exportBackup}
                onImportBackup={backup.importBackup}
                onOpenSchedule={shellState.openScheduleFromSettings}
                onReset={persistence.resetApplication}
                onShareSavedBackup={backup.shareSavedBackup}
                visible={shellState.settingsVisible}
            />
        </>
    );
}
