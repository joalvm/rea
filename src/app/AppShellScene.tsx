import { CalendarScreen } from "../screens/calendar/CalendarScreen";
import { DayDetailScreen } from "../screens/day-detail/DayDetailScreen";
import { DiaryScreen } from "../screens/diary/DiaryScreen";
import { PatternsScreen } from "../screens/patterns/PatternsScreen";
import { TodayScreen } from "../screens/today/TodayScreen";
import { AppData, TabKey } from "../types/app.types";
import { CycleSnapshot } from "../types/cycle.types";
import { DailyLog, MoodCheckIn } from "../types/records.types";

/** Props mínimas para resolver escena activa desde shell principal. */
interface AppShellSceneProps {
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

/** Renderiza la escena principal según la pestaña activa y el día seleccionado. */
export default function AppShellScene({
    activeTab,
    data,
    onCloseDay,
    onEditDailyLog,
    onEditQuickCheckIn,
    onOpenDailyCheckIn,
    onOpenDay,
    onOpenDiaryTab,
    onOpenQuickCheckInNow,
    onOpenSettings,
    onOpenTab,
    selectedDayIso,
    snapshot,
}: AppShellSceneProps) {
    if (activeTab === "today" && selectedDayIso) {
        return (
            <DayDetailScreen
                cycles={data.cycles}
                dailyLogs={data.dailyLogs}
                moodCheckIns={data.moodCheckIns}
                onBack={onCloseDay}
                onOpenDiary={onOpenDiaryTab}
                selectedIso={selectedDayIso}
                settings={data.settings}
            />
        );
    }

    if (activeTab === "calendar") {
        return (
            <CalendarScreen
                cycles={data.cycles}
                dailyLogs={data.dailyLogs}
                onOpenCheckIn={onOpenDailyCheckIn}
                settings={data.settings}
                snapshot={snapshot}
            />
        );
    }

    if (activeTab === "diary") {
        return (
            <DiaryScreen
                dailyLogs={data.dailyLogs}
                moodCheckIns={data.moodCheckIns}
                onEditCheckIn={onEditQuickCheckIn}
                onEditDailyLog={onEditDailyLog}
                onOpenCheckIn={onOpenDailyCheckIn}
                onOpenQuickCheckIn={onOpenQuickCheckInNow}
            />
        );
    }

    if (activeTab === "patterns") {
        return (
            <PatternsScreen
                cycles={data.cycles}
                dailyLogs={data.dailyLogs}
                moodCheckIns={data.moodCheckIns}
                settings={data.settings}
            />
        );
    }

    return (
        <TodayScreen
            cycles={data.cycles}
            dailyLogs={data.dailyLogs}
            moodCheckIns={data.moodCheckIns}
            onOpenCalendar={() => onOpenTab("calendar")}
            onOpenCheckIn={onOpenDailyCheckIn}
            onOpenDay={onOpenDay}
            onOpenPatterns={() => onOpenTab("patterns")}
            onOpenQuickCheckIn={onOpenQuickCheckInNow}
            onOpenSettings={onOpenSettings}
            settings={data.settings}
            snapshot={snapshot}
        />
    );
}
