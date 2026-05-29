import { Cycle, CycleSnapshot } from "../../types/cycle.types";
import { DailyLog, MoodCheckIn } from "../../types/records.types";
import { AppSettings } from "../../types/settings.types";

/** Props del screen principal de hoy. */
export interface TodayScreenProps {
    settings: AppSettings | null;
    cycles: Cycle[];
    snapshot: CycleSnapshot;
    moodCheckIns: MoodCheckIn[];
    dailyLogs: DailyLog[];
    onOpenCheckIn: () => void;
    onOpenDay: (iso: string) => void;
    onOpenQuickCheckIn: () => void;
    onOpenCalendar: () => void;
    onOpenPatterns: () => void;
    onOpenSettings: () => void;
}

/** Paleta visual aplicada al hero editorial de la pantalla Hoy. */
export interface TodayHeroTheme {
    background: string;
    glow: string;
    bubbleColors: string[];
    dateColor: string;
    iconButtonColor: string;
    iconButtonBackground: string;
    phaseIcon: string;
    scenePillColor: string;
    titleColor: string;
    messageColor: string;
    supportColor: string;
    dayBadgeBackground: string;
    dayBadgeBorder: string;
    dayBadgeColor: string;
    statCardBackground: string;
    statCardBorder: string;
    statIconColor: string;
    statLabelColor: string;
    statValueColor: string;
    dividerColor: string;
    buttonBackground: string;
    buttonBorder: string;
    buttonTextColor: string;
    weekPalette: {
        weekdayColor: string;
        todayWeekdayColor: string;
        dayTextColor: string;
        todayBackgroundColor: string;
        todayDayTextColor: string;
    };
}

/** Tono visible para alertas resumidas en Hoy. */
export interface TodayAlertTone {
    label: string;
    background: string;
    ink: string;
}

/** Consejo breve de autocuidado mostrado en Hoy. */
export interface TodayCareTip {
    icon: string;
    text: string;
    color: string;
    background: string;
}

/** Props de una mini estadística del hero. */
export interface TodayMiniStatProps {
    icon: string;
    label: string;
    value: string;
    iconColor: string;
    labelColor: string;
    valueColor: string;
}
