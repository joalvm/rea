import { MomentType } from "./records.types";

/** Define horario configurable para recordatorio recurrente. */
export interface NotificationMoment {
    id: string;
    label: string;
    time: string;
    enabled: boolean;
    days: number[];
    type: MomentType;
    question: string;
    notificationIds?: string[];
}
