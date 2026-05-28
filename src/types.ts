export type Goal = "self_knowledge" | "trying_to_conceive" | "track_only";
export type Regularity = "regular" | "variable" | "irregular";
export type MomentType = "morning" | "night" | "custom" | "now";
export type TabKey = "today" | "calendar" | "diary" | "patterns";
export type PhaseKey = "menstrual" | "follicular" | "fertile" | "luteal";
export type BleedingLevel = "none" | "spotting" | "light" | "medium" | "heavy";

export interface AppSettings {
    onboarded: boolean;
    lastPeriodStart: string;
    cycleLength: number;
    periodLength: number;
    regularity: Regularity;
    hormonalContraception: boolean;
    goal: Goal;
    createdAt: string;
}

export interface Cycle {
    id?: number;
    startDate: string;
    endDate?: string | null;
    predicted: boolean;
    createdAt: string;
}

export interface MoodCheckIn {
    id?: number;
    datetime: string;
    momentType: MomentType;
    mood: number;
    energy: number;
    pain: number;
    stress: number;
    note?: string | null;
}

export interface DailyLog {
    date: string;
    bleedingLevel: BleedingLevel;
    symptoms: string[];
    notes?: string | null;
    updatedAt: string;
}

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

export interface AppData {
    settings: AppSettings | null;
    cycles: Cycle[];
    moodCheckIns: MoodCheckIn[];
    dailyLogs: DailyLog[];
    notificationMoments: NotificationMoment[];
}

export interface CycleSnapshot {
    cycleDay: number;
    phase: PhaseKey;
    phaseLabel: string;
    phaseMessage: string;
    nextPeriodInDays: number;
    fertileWindowLabel: string;
    week: {
        iso: string;
        day: number;
        weekday: string;
        isToday: boolean;
        isPeriod: boolean;
        isFertile: boolean;
    }[];
}
