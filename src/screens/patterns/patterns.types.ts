import { Cycle } from "../../types/cycle.types";
import { EducationalAlert, PatternInsight } from "../../types/insights.types";
import { DailyLog, MoodCheckIn } from "../../types/records.types";
import { AppSettings } from "../../types/settings.types";

/** Props del screen de patrones e insights. */
export interface PatternsScreenProps {
    settings: AppSettings | null;
    cycles: Cycle[];
    moodCheckIns: MoodCheckIn[];
    dailyLogs: DailyLog[];
}

/** Props de una fila de insight detectado. */
export interface InsightRowProps {
    insight: PatternInsight;
}

/** Props de una alerta educativa visual. */
export interface AlertCardProps {
    alert: EducationalAlert;
}

/** Props de una pill métrica usada en resúmenes de ciclo. */
export interface MetricPillProps {
    label: string;
    tone: "soft" | "watch";
}

/** Props de una barra de promedio reciente. */
export interface MetricBarProps {
    label: string;
    value: number;
    color: string;
}

/** Tono visual para representar severidad de alerta. */
export interface AlertTone {
    label: string;
    background: string;
    ink: string;
    icon: string;
}
