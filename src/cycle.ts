import {
    AppSettings,
    Cycle,
    CycleSnapshot,
    CycleSummary,
    DailyLog,
    EducationalAlert,
    MoodCheckIn,
    PatternInsight,
    PhaseKey,
    PredictionConfidence,
} from "./types";

const WEEKDAYS = ["D", "L", "M", "M", "J", "V", "S"];

interface PeriodRun {
    start: string;
    end: string;
    length: number;
}

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

export function estimateCycle(
    settings: AppSettings | null,
    cycles: Cycle[] = [],
    dailyLogs: DailyLog[] = [],
    todayIso = toIsoDate(new Date()),
): CycleSnapshot {
    const fallbackStart = addDays(todayIso, -1);
    const observedBleedingDates = getObservedBleedingDates(dailyLogs);
    const observedRuns = getObservedPeriodRuns(dailyLogs);
    const observedStarts = getObservedCycleStarts(settings, cycles, observedRuns);
    const observedCycleLengths = getObservedCycleLengths(observedStarts);
    const observedPeriodLengths = observedRuns.map((run) => run.length);

    const cycleLength = roundOrFallback(observedCycleLengths, settings?.cycleLength ?? 28, 21, 40);
    const periodLength = roundOrFallback(observedPeriodLengths, settings?.periodLength ?? 5, 2, 10);
    const fertilityVisible = !settings?.hormonalContraception && settings?.goal !== "track_only";
    const confidence = getPredictionConfidence(settings, observedStarts.length, observedCycleLengths.length);
    const anchorStart = findCurrentAnchorStart(observedRuns, observedStarts, settings, todayIso) ?? fallbackStart;
    const source = getSnapshotSource(observedBleedingDates, observedStarts, todayIso);
    const diff = daysBetween(anchorStart, todayIso);
    const cycleDay = (((diff % cycleLength) + cycleLength) % cycleLength) + 1;
    const ovulationDay = Math.max(10, cycleLength - 14);
    const fertileStart = Math.max(1, ovulationDay - 5);
    const fertileEnd = Math.min(cycleLength, ovulationDay + 1);
    const nextPeriodInDays = cycleLength - cycleDay + 1;
    const variabilityDays = getVariabilityDays(observedCycleLengths, settings);
    const phase = getPhase(
        cycleDay,
        periodLength,
        fertileStart,
        fertileEnd,
        fertilityVisible,
        observedBleedingDates.has(todayIso),
    );
    const week = buildWeek(
        todayIso,
        cycleDay,
        periodLength,
        fertileStart,
        fertileEnd,
        cycleLength,
        observedBleedingDates,
        fertilityVisible,
    );

    return {
        cycleDay,
        phase,
        source,
        sourceLabel: getSourceLabel(source),
        confidence,
        confidenceLabel: getConfidenceLabel(confidence),
        confidenceNote: getConfidenceNote(settings, confidence, observedStarts.length),
        phaseLabel: getPhaseLabel(phase),
        phaseMessage: getPhaseMessage({
            phase,
            source,
            confidence,
            nextPeriodInDays,
            fertilityVisible,
            settings,
        }),
        nextPeriodInDays,
        nextPeriodLabel: getNextPeriodLabel(nextPeriodInDays, variabilityDays, confidence, source),
        fertileWindowLabel: getFertilityStatusLabel(
            cycleDay,
            fertileStart,
            cycleLength,
            phase,
            fertilityVisible,
            confidence,
            settings,
        ),
        fertilityVisible,
        fertilityStatusLabel: getFertilityStatusLabel(
            cycleDay,
            fertileStart,
            cycleLength,
            phase,
            fertilityVisible,
            confidence,
            settings,
        ),
        observedCycleCount: observedStarts.length,
        cycleLengthEstimate: cycleLength,
        periodLengthEstimate: periodLength,
        week,
    };
}

function getPhase(
    cycleDay: number,
    periodLength: number,
    fertileStart: number,
    fertileEnd: number,
    fertilityVisible: boolean,
    isObservedBleeding: boolean,
): PhaseKey {
    if (isObservedBleeding) return "menstrual";
    if (cycleDay <= periodLength) return "menstrual";
    if (fertilityVisible && cycleDay >= fertileStart && cycleDay <= fertileEnd) return "fertile";
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

function getPhaseMessage({
    phase,
    source,
    confidence,
    nextPeriodInDays,
    fertilityVisible,
    settings,
}: {
    phase: PhaseKey;
    source: CycleSnapshot["source"];
    confidence: PredictionConfidence;
    nextPeriodInDays: number;
    fertilityVisible: boolean;
    settings: AppSettings | null;
}): string {
    if (settings?.hormonalContraception) {
        return "Con anticonceptivos hormonales esta vista es orientativa. Priorizamos tus registros sobre calendario.";
    }

    if (source === "unknown") {
        return "Base inicial. Marca periodos reales para pasar de referencia suave a seguimiento mas confiable.";
    }

    if (confidence === "low") {
        return "Todavía depende bastante de tu fecha inicial. Cuantos más periodos reales marques, mejor ajusta.";
    }

    switch (phase) {
        case "menstrual":
            return source === "observed"
                ? "Hoy cuenta como observación real de sangrado. Úsalo para ajustar mejor tu ciclo."
                : "Esta etapa se sigue comparando contra tus registros. Flujo, dolor y energía ayudan a afinarla.";
        case "follicular":
            return "Etapa de recuperación orientativa. Lo útil aquí es comparar energía, sueño y ánimo con tus registros.";
        case "fertile":
            return fertilityVisible
                ? "Ventana fértil orientativa. Si buscas precisión, combina señales reales como moco cervical, temperatura o test."
                : "Seguimos mostrando referencia de ciclo, pero no una ventana fértil activa en este modo.";
        case "luteal":
            return `Próxima regla estimada en ${nextPeriodInDays} días. Observa sueño, ánimo y estrés para comparar este tramo.`;
    }
}

function buildWeek(
    todayIso: string,
    cycleDay: number,
    periodLength: number,
    fertileStart: number,
    fertileEnd: number,
    cycleLength: number,
    observedBleedingDates: Set<string>,
    fertilityVisible: boolean,
): CycleSnapshot["week"] {
    const today = parseIsoDate(todayIso);
    const start = new Date(today);
    start.setDate(today.getDate() - 3);

    return Array.from({ length: 7 }, (_, index): CycleSnapshot["week"][number] => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        const iso = toIsoDate(date);
        const dayOffset = daysBetween(todayIso, iso);
        const projectedCycleDay = ((((cycleDay + dayOffset - 1) % cycleLength) + cycleLength) % cycleLength) + 1;
        const isObservedPeriod = observedBleedingDates.has(iso);
        return {
            iso,
            day: date.getDate(),
            weekday: WEEKDAYS[date.getDay()] ?? "",
            isToday: iso === todayIso,
            isPeriod: isObservedPeriod || projectedCycleDay <= periodLength,
            periodSource: isObservedPeriod ? "observed" : projectedCycleDay <= periodLength ? "estimated" : "unknown",
            isFertile:
                fertilityVisible &&
                !isObservedPeriod &&
                projectedCycleDay >= fertileStart &&
                projectedCycleDay <= fertileEnd,
        };
    });
}

export function generateMonthDays(
    target: Date,
    settings: AppSettings | null,
    cycles: Cycle[] = [],
    dailyLogs: DailyLog[] = [],
): {
    iso: string;
    day: number;
    inMonth: boolean;
    phase: PhaseKey;
    phaseSource: CycleSnapshot["source"];
    cycleDay: number;
}[] {
    const first = new Date(target.getFullYear(), target.getMonth(), 1, 12);
    const monthStartWeekday = first.getDay();
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - monthStartWeekday);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);
        const iso = toIsoDate(date);
        const estimate = estimateCycle(settings, cycles, dailyLogs, iso);
        return {
            iso,
            day: date.getDate(),
            inMonth: date.getMonth() === target.getMonth(),
            phase: estimate.phase,
            phaseSource: estimate.source,
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
    if (dailyLogs.some((log) => log.details?.painImpact === "limits_day" || log.details?.painImpact === "stops_day")) {
        insights.push("Hubo días en los que el dolor sí llegó a frenarte. Vale ver si se repite en la misma fase.");
    }
    if (dailyLogs.some((log) => log.details?.medicationRelief === "did_not_help")) {
        insights.push("En algunos días el alivio no fue suficiente. Puede ser útil compararlo con próximos ciclos.");
    }

    return insights.length > 0 ? insights : ["Tus registros se ven estables. Seguiremos observando cambios por fase."];
}

export function buildPatternInsights(
    settings: AppSettings | null,
    cycles: Cycle[],
    dailyLogs: DailyLog[],
    moodCheckIns: MoodCheckIn[],
): PatternInsight[] {
    const insights: PatternInsight[] = [];
    const phaseBuckets = buildPhaseBuckets(settings, cycles, dailyLogs, moodCheckIns);
    const highestPain = findPhaseExtreme(phaseBuckets, "pain", "max");
    const lowestEnergy = findPhaseExtreme(phaseBuckets, "energy", "min");
    const highestStress = findPhaseExtreme(phaseBuckets, "stress", "max");
    const topSymptoms = summarizeTopSymptoms(dailyLogs, 2);
    const limitingPainDays = countLimitingPainDays(dailyLogs);
    const medicationRoughDays = dailyLogs.filter(
        (log) => log.details?.medicationRelief === "partly_helped" || log.details?.medicationRelief === "did_not_help",
    ).length;

    if (highestPain && highestPain.average >= 2.8) {
        insights.push({
            id: "phase-pain",
            title: `Dolor más alto en ${phaseLabelWithArticle(highestPain.phase)}`,
            detail: `Promedio ${highestPain.average.toFixed(1)}/5 en ${highestPain.count} momentos. Sirve comparar qué lo acompaña en esa fase.`,
            tone: "watch",
        });
    }

    if (lowestEnergy && lowestEnergy.average <= 3) {
        insights.push({
            id: "phase-energy",
            title: `Energía más baja en ${phaseLabelWithArticle(lowestEnergy.phase)}`,
            detail: `Promedio ${lowestEnergy.average.toFixed(1)}/5 en ${lowestEnergy.count} momentos. Ahí vale mirar sueño, carga mental y dolor.`,
            tone: "supportive",
        });
    }

    if (highestStress && highestStress.average >= 2.8) {
        insights.push({
            id: "phase-stress",
            title: `Estrés más alto en ${phaseLabelWithArticle(highestStress.phase)}`,
            detail: `Promedio ${highestStress.average.toFixed(1)}/5 en ${highestStress.count} momentos. Conviene ver si coincide con menos descanso o más dolor.`,
            tone: "watch",
        });
    }

    if (topSymptoms[0] && topSymptoms[0].count >= 2) {
        insights.push({
            id: "top-symptom",
            title: `Síntoma que más se repite: ${topSymptoms[0].label}`,
            detail: `Aparece en ${topSymptoms[0].count} días registrados. Si vuelve a repetirse, ya deja de ser dato aislado.`,
            tone: "supportive",
        });
    }

    if (limitingPainDays > 0) {
        insights.push({
            id: "pain-impact",
            title: `Dolor que sí frenó tu día: ${limitingPainDays}`,
            detail: `Ya no es solo molestia leve. Vale ver si cae siempre en el mismo tramo del ciclo.`,
            tone: "watch",
        });
    }

    if (medicationRoughDays > 0) {
        insights.push({
            id: "medication-relief",
            title: `Alivio parcial o nulo: ${medicationRoughDays} días`,
            detail: `Te da una señal concreta para comparar qué tan manejable fue ese dolor de un ciclo a otro.`,
            tone: "watch",
        });
    }

    return insights.slice(0, 5);
}

export function buildEducationalAlerts(
    settings: AppSettings | null,
    cycles: Cycle[],
    dailyLogs: DailyLog[],
    moodCheckIns: MoodCheckIn[],
    todayIso = toIsoDate(new Date()),
): EducationalAlert[] {
    const alerts: EducationalAlert[] = [];
    const observedRuns = getObservedPeriodRuns(dailyLogs);
    const observedStarts = getObservedCycleStarts(settings, cycles, observedRuns);
    const cycleLengths = getObservedCycleLengths(observedStarts);
    const heavyDays = dailyLogs.filter((log) => log.bleedingLevel === "heavy").length;
    const largeClotDays = dailyLogs.filter((log) => log.details?.clotSize === "large").length;
    const limitingPainDays = countLimitingPainDays(dailyLogs);
    const highPainMoments = moodCheckIns.filter((item) => item.pain >= 4).length;
    const noReliefDays = dailyLogs.filter((log) => log.details?.medicationRelief === "did_not_help").length;
    const longPeriods = observedRuns.filter((run) => run.length > 7);
    const outOfRangeCycles = cycleLengths.filter((days) => days < 21 || days > 35);
    const lastObservedStart = observedStarts[observedStarts.length - 1];
    const daysSinceLastObserved = lastObservedStart ? daysBetween(lastObservedStart, todayIso) : 0;

    if (longPeriods.length > 0) {
        const longest = Math.max(...longPeriods.map((run) => run.length));
        alerts.push({
            id: "long-period",
            severity: "consult",
            title: "Sangrado más largo de lo habitual",
            detail: `Ya registraste un periodo de ${longest} días. Si vuelve a pasar, conviene comentarlo con profesional.`,
        });
    }

    if (heavyDays >= 2 || largeClotDays >= 1) {
        alerts.push({
            id: "heavy-bleeding",
            severity: heavyDays >= 3 || largeClotDays >= 2 ? "consult" : "watch",
            title: "Flujo abundante para vigilar",
            detail: "Hay registros de sangrado abundante o coágulos grandes. Si se repite o te empapa muy rápido, conviene consultar.",
        });
    }

    if (limitingPainDays >= 2 || (highPainMoments >= 3 && noReliefDays >= 1)) {
        alerts.push({
            id: "pain-impact",
            severity: "consult",
            title: "Dolor que ya impacta tu rutina",
            detail: "Registraste días en los que dolor te limitó o no respondió bien. Si sigue así, vale hablarlo con profesional.",
        });
    }

    if (outOfRangeCycles.length >= 2) {
        alerts.push({
            id: "cycle-range",
            severity: "watch",
            title: "Ciclos fuera de rango típico",
            detail: "Tus ciclos observados no siempre caen entre 21 y 35 días. Sin diagnosticar nada, es buena señal para seguir mirando o consultar si persiste.",
        });
    }

    if (lastObservedStart && daysSinceLastObserved > 90) {
        alerts.push({
            id: "long-gap",
            severity: "consult",
            title: "Mucho tiempo sin periodo observado",
            detail: "Pasaron más de 90 días desde último inicio observado. Si no hay una explicación clara, conviene consultarlo.",
        });
    }

    return sortAlerts(alerts);
}

export function buildCycleSummaries(
    settings: AppSettings | null,
    cycles: Cycle[],
    dailyLogs: DailyLog[],
    limit = 6,
): CycleSummary[] {
    const observedRuns = [...getObservedPeriodRuns(dailyLogs)].sort((left, right) =>
        right.start.localeCompare(left.start),
    );
    const allLogs = [...dailyLogs];

    return observedRuns.slice(0, limit).map((run, index) => {
        const olderRun = observedRuns[index + 1];
        const logsInRun = allLogs.filter((log) => log.date >= run.start && log.date <= run.end);
        const topSymptoms = summarizeTopSymptoms(logsInRun, 2).map((item) => item.label);

        return {
            id: `${run.start}-${index}`,
            startDate: run.start,
            endDate: run.end,
            source: "observed",
            cycleLengthDays: olderRun ? daysBetween(olderRun.start, run.start) : null,
            bleedingDays: run.length,
            heavyDays: logsInRun.filter((log) => log.bleedingLevel === "heavy").length,
            painImpactDays: countLimitingPainDays(logsInRun),
            topSymptoms,
        };
    });
}

export function summarizeTopSymptoms(logs: DailyLog[], limit = 5) {
    const counts = new Map<string, number>();
    logs.forEach((log) => {
        log.symptoms.forEach((symptom) => counts.set(symptom, (counts.get(symptom) ?? 0) + 1));
    });

    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([label, count]) => ({ label, count }));
}

type PhaseBucket = {
    mood: number[];
    energy: number[];
    pain: number[];
    stress: number[];
};

type PhaseMetricKey = keyof PhaseBucket;

function buildPhaseBuckets(
    settings: AppSettings | null,
    cycles: Cycle[],
    dailyLogs: DailyLog[],
    moodCheckIns: MoodCheckIn[],
): Map<PhaseKey, PhaseBucket> {
    const buckets = new Map<PhaseKey, PhaseBucket>();

    moodCheckIns.forEach((item) => {
        const iso = toIsoDate(new Date(item.datetime));
        const phase = estimateCycle(settings, cycles, dailyLogs, iso).phase;
        const bucket = buckets.get(phase) ?? { mood: [], energy: [], pain: [], stress: [] };
        bucket.mood.push(item.mood);
        bucket.energy.push(item.energy);
        bucket.pain.push(item.pain);
        bucket.stress.push(item.stress);
        buckets.set(phase, bucket);
    });

    return buckets;
}

function findPhaseExtreme(
    buckets: Map<PhaseKey, PhaseBucket>,
    metric: PhaseMetricKey,
    direction: "min" | "max",
): { phase: PhaseKey; average: number; count: number } | null {
    let winner: { phase: PhaseKey; average: number; count: number } | null = null;

    buckets.forEach((bucket, phase) => {
        const values = bucket[metric] as number[];
        if (values.length < 2) return;
        const current = { phase, average: average(values), count: values.length };

        if (!winner) {
            winner = current;
            return;
        }

        if (direction === "max" && current.average > winner.average) {
            winner = current;
        }

        if (direction === "min" && current.average < winner.average) {
            winner = current;
        }
    });

    return winner;
}

function countLimitingPainDays(logs: DailyLog[]) {
    return logs.filter((log) => log.details?.painImpact === "limits_day" || log.details?.painImpact === "stops_day")
        .length;
}

function phaseLabelWithArticle(phase: PhaseKey) {
    if (phase === "menstrual") return "tu fase menstrual";
    if (phase === "follicular") return "tu fase folicular";
    if (phase === "fertile") return "tu ventana fértil orientativa";
    return "tu fase lútea";
}

function sortAlerts(alerts: EducationalAlert[]) {
    const weight: Record<EducationalAlert["severity"], number> = {
        consult: 0,
        watch: 1,
        info: 2,
    };

    return [...alerts].sort((left, right) => weight[left.severity] - weight[right.severity]);
}

function getObservedCycleStarts(settings: AppSettings | null, cycles: Cycle[], observedRuns: PeriodRun[]) {
    const cycleStarts = cycles
        .filter((cycle) => cycle.source === "observed" || cycle.predicted === false)
        .map((cycle) => cycle.startDate);

    const fromRuns = observedRuns.map((run) => run.start);
    const seed = settings?.lastPeriodStart ? [settings.lastPeriodStart] : [];
    return uniqueDates([...seed, ...cycleStarts, ...fromRuns]);
}

function getObservedCycleLengths(starts: string[]) {
    return starts
        .slice(1)
        .map((startDate, index) => daysBetween(starts[index] ?? startDate, startDate))
        .filter((days) => days >= 18 && days <= 60);
}

function getObservedBleedingDates(dailyLogs: DailyLog[]) {
    return new Set(dailyLogs.filter((log) => isBleedingDay(log)).map((log) => log.date));
}

function getObservedPeriodRuns(dailyLogs: DailyLog[]): PeriodRun[] {
    const sorted = [...dailyLogs].sort((left, right) => left.date.localeCompare(right.date));
    const runs: PeriodRun[] = [];
    let currentStart: string | null = null;
    let currentEnd: string | null = null;

    const closeRun = () => {
        if (!currentStart || !currentEnd) return;
        runs.push({
            start: currentStart,
            end: currentEnd,
            length: daysBetween(currentStart, currentEnd) + 1,
        });
        currentStart = null;
        currentEnd = null;
    };

    for (const log of sorted) {
        if (!isBleedingDay(log)) {
            closeRun();
            continue;
        }

        const forcedStart = log.details?.periodStarted === true;
        if (!currentStart || !currentEnd) {
            currentStart = log.date;
            currentEnd = log.date;
        } else {
            const gap = daysBetween(currentEnd, log.date);
            if (forcedStart || gap > 1) {
                closeRun();
                currentStart = log.date;
            }
            currentEnd = log.date;
        }

        if (log.details?.periodEnded) {
            closeRun();
        }
    }

    closeRun();
    return runs;
}

function findCurrentAnchorStart(
    observedRuns: PeriodRun[],
    observedStarts: string[],
    settings: AppSettings | null,
    todayIso: string,
) {
    const currentRun = observedRuns.find((run) => run.start <= todayIso && run.end >= todayIso);
    if (currentRun) return currentRun.start;
    return findLastOnOrBefore(observedStarts, todayIso) ?? settings?.lastPeriodStart ?? null;
}

function findLastOnOrBefore(values: string[], targetIso: string) {
    for (let index = values.length - 1; index >= 0; index -= 1) {
        if ((values[index] ?? "") <= targetIso) {
            return values[index] ?? null;
        }
    }
    return null;
}

function getSnapshotSource(
    observedBleedingDates: Set<string>,
    observedStarts: string[],
    todayIso: string,
): CycleSnapshot["source"] {
    if (observedBleedingDates.has(todayIso)) return "observed";
    if (findLastOnOrBefore(observedStarts, todayIso)) return "estimated";
    return "unknown";
}

function getPredictionConfidence(
    settings: AppSettings | null,
    observedCycleCount: number,
    measuredCycleCount: number,
): PredictionConfidence {
    if (settings?.hormonalContraception) return "low";

    let score = 0;
    if (measuredCycleCount >= 3) score += 2;
    else if (measuredCycleCount >= 1) score += 1;
    if (observedCycleCount >= 3) score += 1;
    if (settings?.regularity === "variable") score -= 1;
    if (settings?.regularity === "irregular") score -= 2;

    if (score >= 3) return "high";
    if (score >= 1) return "medium";
    return "low";
}

function getSourceLabel(source: CycleSnapshot["source"]) {
    if (source === "observed") return "Observado";
    if (source === "estimated") return "Estimado";
    return "Sin datos";
}

function getConfidenceLabel(confidence: PredictionConfidence) {
    if (confidence === "high") return "Confianza alta";
    if (confidence === "medium") return "Confianza media";
    return "Confianza baja";
}

function getConfidenceNote(settings: AppSettings | null, confidence: PredictionConfidence, observedCycleCount: number) {
    if (settings?.hormonalContraception) {
        return "Con anticonceptivos hormonales priorizamos lo observado y bajamos confianza del calendario.";
    }

    if (confidence === "high") {
        return `Base fuerte: ${observedCycleCount} ciclos observados recientes.`;
    }

    if (confidence === "medium") {
        return `Base mixta: ${observedCycleCount} ciclos observados y tu configuracion inicial.`;
    }

    return observedCycleCount <= 1
        ? "Base inicial. Todavia depende bastante de la fecha con la que empezaste."
        : `Base parcial: ${observedCycleCount} ciclos observados aun no bastan para dar mucha confianza.`;
}

function getNextPeriodLabel(
    nextPeriodInDays: number,
    variabilityDays: number,
    confidence: PredictionConfidence,
    source: CycleSnapshot["source"],
) {
    if (source === "unknown") return "Sin rango claro";
    if (confidence === "high" && variabilityDays <= 2) {
        return `En ${nextPeriodInDays} días`;
    }

    const halfRange = Math.max(1, Math.ceil(variabilityDays / 2));
    const start = Math.max(1, nextPeriodInDays - halfRange);
    const end = nextPeriodInDays + halfRange;
    return `Entre ${start} y ${end} días`;
}

function getFertilityStatusLabel(
    cycleDay: number,
    fertileStart: number,
    cycleLength: number,
    phase: PhaseKey,
    fertilityVisible: boolean,
    confidence: PredictionConfidence,
    settings: AppSettings | null,
) {
    if (!fertilityVisible) {
        return settings?.hormonalContraception ? "Oculta" : "No priorizada";
    }

    if (phase === "fertile") return confidence === "low" ? "Aprox. ahora" : "Ahora";

    const daysToFertility = getDaysToFertility(cycleDay, fertileStart, cycleLength);
    return confidence === "low" ? `Aprox. en ${daysToFertility} días` : `En ${daysToFertility} días`;
}

function getDaysToFertility(cycleDay: number, fertileStart: number, cycleLength: number) {
    if (cycleDay < fertileStart) return fertileStart - cycleDay;
    return cycleLength - cycleDay + fertileStart;
}

function getVariabilityDays(values: number[], settings: AppSettings | null) {
    if (values.length >= 2) {
        return Math.max(...values) - Math.min(...values);
    }

    if (settings?.regularity === "irregular") return 6;
    if (settings?.regularity === "variable") return 4;
    return 2;
}

function roundOrFallback(values: number[], fallback: number, min: number, max: number) {
    if (values.length === 0) return fallback;
    return clamp(Math.round(average(values)), min, max);
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function uniqueDates(values: string[]) {
    return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function isBleedingDay(log: DailyLog) {
    return log.bleedingLevel !== "none";
}

export function average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}
