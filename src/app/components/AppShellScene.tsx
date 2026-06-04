import { CalendarScreen } from "@/screens/calendar/CalendarScreen";
import { DayDetailScreen } from "@/screens/day-detail/DayDetailScreen";
import { DiaryScreen } from "@/screens/diary/DiaryScreen";
import { StatisticsScreen } from "@/screens/statistics/StatisticsScreen";
import { TodayScreen } from "@/screens/today/TodayScreen";
import { TabKey } from "@/types/app.types";
import { DailyLog, MoodCheckIn } from "@/types/records.types";

/** Props mínimas para resolver escena activa desde shell principal. */
interface AppShellSceneProps {
    activeTab: TabKey;
    onCloseDay: () => void;
    onEditDailyLog: (entry: DailyLog) => void;
    onEditQuickCheckIn: (entry: MoodCheckIn, initialDailyLog?: DailyLog | null) => void;
    onOpenDailyCheckIn: () => void;
    onOpenDay: (iso: string) => void;
    onOpenDiaryTab: () => void;
    onOpenQuickCheckInNow: () => void;
    onOpenSettings: () => void;
    selectedDayIso: string | null;
}

/** Renderiza la escena principal según la pestaña activa y el día seleccionado. */
export default function AppShellScene({
    activeTab,
    onCloseDay,
    onEditDailyLog,
    onEditQuickCheckIn,
    onOpenDailyCheckIn,
    onOpenDay,
    onOpenDiaryTab,
    onOpenQuickCheckInNow,
    onOpenSettings,
    selectedDayIso,
}: AppShellSceneProps) {
    if (selectedDayIso) {
        return <DayDetailScreen onBack={onCloseDay} onOpenDiary={onOpenDiaryTab} selectedIso={selectedDayIso} />;
    }

    if (activeTab === "calendar") {
        return <CalendarScreen onOpenCheckIn={onOpenDailyCheckIn} onOpenDay={onOpenDay} />;
    }

    if (activeTab === "diary") {
        return (
            <DiaryScreen
                onEditCheckIn={onEditQuickCheckIn}
                onEditDailyLog={onEditDailyLog}
                onOpenCheckIn={onOpenDailyCheckIn}
                onOpenQuickCheckIn={onOpenQuickCheckInNow}
            />
        );
    }

    if (activeTab === "statistics") {
        return <StatisticsScreen />;
    }

    return <TodayScreen onOpenCheckIn={onOpenDailyCheckIn} onOpenDay={onOpenDay} onOpenSettings={onOpenSettings} />;
}
