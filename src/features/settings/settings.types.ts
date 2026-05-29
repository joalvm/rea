import { NotificationMoment } from "../../types/notifications.types";

/** Props del modal principal de ajustes. */
export interface SettingsModalProps {
    visible: boolean;
    moments: NotificationMoment[];
    onClose: () => void;
    onOpenSchedule: () => void;
    onReset: () => Promise<void>;
}

/** Props del modal de horarios de recordatorio. */
export interface ScheduleModalProps {
    visible: boolean;
    moments: NotificationMoment[];
    onClose: () => void;
    onChange: (moments: NotificationMoment[]) => Promise<void>;
}
