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

/** Props de una fila accionable dentro del modal de ajustes. */
export interface SettingRowProps {
    title: string;
    text: string;
    meta: string;
    icon: string;
    onPress: () => void;
}

/** Día abreviado usado para edición de repetición semanal. */
export interface ScheduleDayOption {
    key: number;
    label: string;
}

/** Props de una tarjeta editable de horario. */
export interface ScheduleMomentCardProps {
    moment: NotificationMoment;
    days: ScheduleDayOption[];
    onUpdate: (id: string, patch: Partial<NotificationMoment>) => void;
    onRemove: (id: string) => void;
}
