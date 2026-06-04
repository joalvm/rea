import type { UseAppBackupControllerResult } from "../hooks/useAppBackupController";
import type { UseAppBootstrapControllerResult } from "../hooks/useAppBootstrapController";
import type { UseAppShellStateResult } from "../hooks/useAppShellState";
import { CheckInModal } from "../../features/check-in/CheckInModal";
import { CheckInSubmission } from "../../features/check-in/check-in.types";
import { ScheduleModal } from "../../features/settings/ScheduleModal";
import { SettingsModal } from "../../features/settings/SettingsModal";
import { NotificationCadence } from "../../types/notifications.types";
import { MoodCheckIn } from "../../types/records.types";
import { AppSettings } from "../../types/settings.types";

interface AppShellModalsProps {
    bootstrap: UseAppBootstrapControllerResult;
    backup: UseAppBackupControllerResult;
    deleteCheckIn: (moodCheckIn?: MoodCheckIn | null) => Promise<void>;
    onResetApplication: () => Promise<void>;
    saveAppSettings: (settings: AppSettings) => Promise<void>;
    saveCheckIn: (submission: CheckInSubmission) => Promise<void>;
    saveNotificationCadence: (notificationCadence: NotificationCadence) => Promise<void>;
    seedDevelopmentUserData: () => Promise<void>;
    shellState: UseAppShellStateResult;
}

/** Renderiza modales raíz del shell usando contratos reales de estado y acciones. */
export default function AppShellModals({
    bootstrap,
    backup,
    deleteCheckIn,
    onResetApplication,
    saveAppSettings,
    saveCheckIn,
    saveNotificationCadence,
    seedDevelopmentUserData,
    shellState,
}: AppShellModalsProps) {
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
                onDelete={deleteCheckIn}
                onSave={saveCheckIn}
                dailyLogOnly={shellState.checkIn.dailyLogOnly}
                promptContext={shellState.checkIn.promptContext}
                visible={shellState.checkIn.visible}
            />
            <ScheduleModal
                cadence={bootstrap.notificationCadence}
                onChange={saveNotificationCadence}
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
                onGenerateDevelopmentData={seedDevelopmentUserData}
                onImportBackup={backup.importBackup}
                onOpenSchedule={shellState.openScheduleFromSettings}
                onReset={onResetApplication}
                onSaveSettings={saveAppSettings}
                onShareSavedBackup={backup.shareSavedBackup}
                settings={bootstrap.settings}
                visible={shellState.settingsVisible}
            />
        </>
    );
}
