import { AppSettings, CycleSnapshot, DailyLog, MoodCheckIn, PhaseKey } from "./types";

const WEEKDAYS = ["D", "L", "M", "M", "J", "V", "S"];

export function toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function parseIsoDate(iso: string): Date {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1, 12, 0, 0, 0);
}

export function addDays(iso: string, days: number): string {
    const date = parseIsoDate(iso);
    date.setDate(date.getDate() + days);
    return toIsoDate(date);
}

export function daysBetween(startIso: string, endIso: string): number {
    const start = parseIsoDate(startIso).getTime();
    const end = parseIsoDate(endIso).getTime();
    return Math.round((end - start) / 86400000);
}

export function formatShortDate(iso: string): string {
    const date = parseIsoDate(iso);
    return date.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

export function monthTitle(date: Date): string {
    const title = date.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
    return title.charAt(0).toUpperCase() + title.slice(1);
}

export function estimateCycle(settings: AppSettings | null, todayIso = toIsoDate(new Date())): CycleSnapshot {
    const fallbackStart = addDays(todayIso, -1);
    const cycleLength = settings?.cycleLength ?? 28;
    const periodLength = settings?.periodLength ?? 5;
    const lastStart = settings?.lastPeriodStart ?? fallbackStart;
    const diff = daysBetween(lastStart, todayIso);
    const cycleDay = (((diff % cycleLength) + cycleLength) % cycleLength) + 1;
    const ovulationDay = Math.max(10, cycleLength - 14);
    const fertileStart = Math.max(1, ovulationDay - 5);
    const fertileEnd = Math.min(cycleLength, ovulationDay + 1);
    const nextPeriodInDays = cycleLength - cycleDay + 1;
    const phase = getPhase(cycleDay, periodLength, fertileStart, fertileEnd);
    const week = buildWeek(todayIso, cycleDay, periodLength, fertileStart, fertileEnd, cycleLength);

    return {
        cycleDay,
        phase,
        phaseLabel: getPhaseLabel(phase),
        phaseMessage: getPhaseMessage(phase, nextPeriodInDays),
        nextPeriodInDays,
        fertileWindowLabel:
            cycleDay >= fertileStart && cycleDay <= fertileEnd
                ? "Ventana fértil aproximada"
                : `Fertilidad estimada en ${Math.max(1, fertileStart - cycleDay)} días`,
        week,
    };
}

function getPhase(cycleDay: number, periodLength: number, fertileStart: number, fertileEnd: number): PhaseKey {
    if (cycleDay <= periodLength) return "menstrual";
    if (cycleDay >= fertileStart && cycleDay <= fertileEnd) return "fertile";
    if (cycleDay < fertileStart) return "follicular";
    return "luteal";
}

function getPhaseLabel(phase: PhaseKey): string {
    switch (phase) {
        case "menstrual":
            return "Periodo";
        case "follicular":
            return "Fase folicular";
        case "fertile":
            return "Fase fértil";
        case "luteal":
            return "Fase lútea";
    }
}

function getPhaseMessage(phase: PhaseKey, nextPeriodInDays: number): string {
    switch (phase) {
        case "menstrual":
            return "Cuéntame flujo, dolor y energía para entender cómo cambia este inicio de ciclo.";
        case "follicular":
            return "Puede sentirse como una etapa de recuperación. Lo iremos comparando con tus registros.";
        case "fertile":
            return "Estimación orientativa. Si buscas precisión, combina señales como temperatura o test de ovulación.";
        case "luteal":
            return `Próximo periodo estimado en ${nextPeriodInDays} días. Observa sueño, ánimo y estrés.`;
    }
}

function buildWeek(
    todayIso: string,
    cycleDay: number,
    periodLength: number,
    fertileStart: number,
    fertileEnd: number,
    cycleLength: number,
) {
    const today = parseIsoDate(todayIso);
    const start = new Date(today);
    start.setDate(today.getDate() - 3);

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        const iso = toIsoDate(date);
        const dayOffset = daysBetween(todayIso, iso);
        const projectedCycleDay = ((((cycleDay + dayOffset - 1) % cycleLength) + cycleLength) % cycleLength) + 1;
        return {
            iso,
            day: date.getDate(),
            weekday: WEEKDAYS[date.getDay()] ?? "",
            isToday: iso === todayIso,
            isPeriod: projectedCycleDay <= periodLength,
            isFertile: projectedCycleDay >= fertileStart && projectedCycleDay <= fertileEnd,
        };
    });
}

export function generateMonthDays(
    target: Date,
    settings: AppSettings | null,
): { iso: string; day: number; inMonth: boolean; phase: PhaseKey; cycleDay: number }[] {
    const first = new Date(target.getFullYear(), target.getMonth(), 1, 12);
    const monthStartWeekday = first.getDay();
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - monthStartWeekday);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);
        const iso = toIsoDate(date);
        const estimate = estimateCycle(settings, iso);
        return {
            iso,
            day: date.getDate(),
            inMonth: date.getMonth() === target.getMonth(),
            phase: estimate.phase,
            cycleDay: estimate.cycleDay,
        };
    });
}

export function buildPersonalInsights(checkIns: MoodCheckIn[], dailyLogs: DailyLog[]): string[] {
    const insights: string[] = [];
    if (checkIns.length < 4) {
        return ["Con 4 registros empezamos a ver patrones propios, sin asumir causas hormonales."];
    }

    const avgPain = average(checkIns.map((item) => item.pain));
    const avgStress = average(checkIns.map((item) => item.stress));
    const avgEnergy = average(checkIns.map((item) => item.energy));

    if (avgPain >= 3.2) insights.push("En tus registros recientes el dolor aparece por encima de lo habitual.");
    if (avgStress >= 3.4) insights.push("Parece que el estrés ha sido una señal frecuente en tus últimos momentos.");
    if (avgEnergy <= 2.4) insights.push("Suele aparecer energía baja en tus registros recientes.");
    if (dailyLogs.some((log) => log.symptoms.includes("cólicos")))
        insights.push("Los cólicos aparecen en tu diario. Los iremos comparando con próximos ciclos.");

    return insights.length > 0 ? insights : ["Tus registros se ven estables. Seguiremos observando cambios por fase."];
}

export function average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}
