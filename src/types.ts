export type Goal = "self_knowledge" | "trying_to_conceive" | "track_only";
export type Regularity = "regular" | "variable" | "irregular";
export type MomentType = "morning" | "night" | "custom" | "now";
export type TabKey = "today" | "calendar" | "diary" | "patterns";
export type PhaseKey = "menstrual" | "follicular" | "fertile" | "luteal";
export type BleedingLevel = "none" | "spotting" | "light" | "medium" | "heavy";
export type DataSource = "observed" | "estimated" | "unknown";
export type PredictionConfidence = "low" | "medium" | "high";
export type ClotSize = "none" | "small" | "medium" | "large";
export type PainImpact = "none" | "noticeable" | "limits_day" | "stops_day";
export type MedicationRelief = "not_applicable" | "helped" | "partly_helped" | "did_not_help";

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
    source?: DataSource;
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
    source?: DataSource;
    details?: {
        periodStarted?: boolean;
        periodEnded?: boolean;
        clotSize?: ClotSize;
        painImpact?: PainImpact;
        medicationName?: string | null;
        medicationRelief?: MedicationRelief;
    } | null;
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
    source: DataSource;
    sourceLabel: string;
    confidence: PredictionConfidence;
    confidenceLabel: string;
    confidenceNote: string;
    phaseLabel: string;
    phaseMessage: string;
    nextPeriodInDays: number;
    nextPeriodLabel: string;
    fertileWindowLabel: string;
    fertilityVisible: boolean;
    fertilityStatusLabel: string;
    observedCycleCount: number;
    cycleLengthEstimate: number;
    periodLengthEstimate: number;
    week: {
        iso: string;
        day: number;
        weekday: string;
        isToday: boolean;
        isPeriod: boolean;
        periodSource: DataSource;
        isFertile: boolean;
    }[];
}
