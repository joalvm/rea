import { AppData, TabKey } from "../types/app.types";
import { CycleSnapshot } from "../types/cycle.types";
import { DailyLog, MomentType, MoodCheckIn } from "../types/records.types";

/** Estado local del modal de check-in manejado por shell principal. */
export interface CheckInState {
    visible: boolean;
    sessionKey: number;
    mode: "daily" | "quick";
    momentType: MomentType;
    question: string;
    saveTarget: "checkIn" | "dailyLog" | "both";
    initialCheckIn: MoodCheckIn | null;
    initialDailyLog: DailyLog | null;
}

/** Estado inicial vacío para shell antes de bootstrap local. */
export const initialData: AppData = {
    settings: null,
    cycles: [],
    moodCheckIns: [],
    dailyLogs: [],
    notificationMoments: [],
};

/** Props mínimas para resolver la escena activa desde el shell principal. */
export interface AppShellSceneProps {
    activeTab: TabKey;
    data: AppData;
    onCloseDay: () => void;
    onEditDailyLog: (entry: DailyLog) => void;
    onEditQuickCheckIn: (entry: MoodCheckIn) => void;
    onOpenDailyCheckIn: () => void;
    onOpenDay: (iso: string) => void;
    onOpenDiaryTab: () => void;
    onOpenQuickCheckInNow: () => void;
    onOpenSettings: () => void;
    onOpenTab: (tab: TabKey) => void;
    selectedDayIso: string | null;
    snapshot: CycleSnapshot;
}
