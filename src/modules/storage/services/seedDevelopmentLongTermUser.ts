import { addDays, toIsoDate } from "@/modules/cycle/utils/cycleDate.utils";
import createDefaultNotificationCadence from "@/modules/notifications/defaults/createDefaultNotificationCadence";
import { saveNotificationCadence } from "@/modules/storage/repositories/notificationMoments.repository";
import { upsertDailyLog } from "@/modules/storage/repositories/dailyLogs.repository";
import { upsertMoodCheckIn } from "@/modules/storage/repositories/moodCheckIns.repository";
import { saveSettings } from "@/modules/storage/repositories/settings.repository";
import { NotificationCadence } from "@/types/notifications.types";
import { DailyLog, MoodCheckIn, SymptomKey } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";

import resetAppData from "./resetAppData";
import syncObservedCyclesFromDailyLogs from "./syncObservedCycles";

const CYCLE_LENGTHS = [29, 30, 28, 31, 29, 27, 30, 29, 28];
const PERIOD_LENGTHS = [5, 4, 5, 6, 5, 4, 5, 5, 4];
const PERIOD_FLOW: DailyLog["bleedingLevel"][] = ["medium", "heavy", "heavy", "medium", "light", "spotting"];

interface SeedDevelopmentLongTermUserParams {
    notificationCadence?: NotificationCadence;
}

interface SeedDevelopmentLongTermUserResult {
    latestCheckInAt: string;
    notificationCadence: NotificationCadence;
    settings: AppSettings;
}

/** Siembra dataset largo y coherente para desarrollo local. */
export default async function seedDevelopmentLongTermUser({
    notificationCadence,
}: SeedDevelopmentLongTermUserParams = {}): Promise<SeedDevelopmentLongTermUserResult> {
    const todayIso = toIsoDate(new Date());
    const cycleStarts = buildCycleStarts(todayIso);
    const latestPeriodStart = cycleStarts[cycleStarts.length - 1] ?? addDays(todayIso, -12);
    const settings = buildSeedSettings(latestPeriodStart, cycleStarts[cycleStarts.length - 2]);
    const dailyLogs = buildDailyLogs(todayIso, cycleStarts);
    const moodCheckIns = buildMoodCheckIns(todayIso, cycleStarts, dailyLogs);
    const latestCheckInAt = moodCheckIns[moodCheckIns.length - 1]?.datetime ?? `${todayIso}T20:15:00.000Z`;
    const nextCadence = {
        ...(notificationCadence ?? createDefaultNotificationCadence()),
        notificationIds: [],
        lastPromptAt: null,
        lastCompletedCheckInAt: latestCheckInAt,
    };

    await resetAppData();
    await saveSettings(settings);
    await saveNotificationCadence(nextCadence);

    for (const log of dailyLogs) {
        await upsertDailyLog(log);
    }

    for (const checkIn of moodCheckIns) {
        await upsertMoodCheckIn(checkIn);
    }

    await syncObservedCyclesFromDailyLogs();

    return {
        latestCheckInAt,
        notificationCadence: nextCadence,
        settings,
    };
}

function buildSeedSettings(latestPeriodStart: string, previousPeriodStart?: string): AppSettings {
    return {
        onboarded: true,
        lastPeriodStart: latestPeriodStart,
        cycleLength: 29,
        periodLength: 5,
        regularity: previousPeriodStart ? "variable" : "regular",
        hormonalContraception: false,
        tryingToConceive: true,
        createdAt: `${addDays(latestPeriodStart, -220)}T10:00:00.000Z`,
    };
}

function buildCycleStarts(todayIso: string) {
    const starts = [addDays(todayIso, -245)];

    for (let index = 0; index < CYCLE_LENGTHS.length - 1; index += 1) {
        const previousStart = starts[index] ?? starts[0] ?? todayIso;
        starts.push(addDays(previousStart, CYCLE_LENGTHS[index] ?? 29));
    }

    return starts;
}

function buildDailyLogs(todayIso: string, cycleStarts: string[]) {
    const logs = new Map<string, DailyLog>();

    cycleStarts.forEach((cycleStart, cycleIndex) => {
        const nextCycleStart = cycleStarts[cycleIndex + 1] ?? addDays(todayIso, 18);
        const cycleLength = CYCLE_LENGTHS[cycleIndex] ?? 29;
        const periodLength = PERIOD_LENGTHS[cycleIndex] ?? 5;
        const fertileStartOffset = Math.max(8, cycleLength - 19);

        for (let offset = 0; offset < periodLength; offset += 1) {
            const iso = addDays(cycleStart, offset);
            logs.set(iso, buildPeriodLog(iso, offset, periodLength));
        }

        for (let offset = fertileStartOffset; offset < fertileStartOffset + 3; offset += 1) {
            const iso = addDays(cycleStart, offset);
            if (iso > todayIso) {
                continue;
            }

            logs.set(iso, buildFertileLog(iso, offset - fertileStartOffset));
        }

        for (let offset = 4; offset >= 1; offset -= 1) {
            const iso = addDays(nextCycleStart, -offset);
            if (iso > todayIso) {
                continue;
            }

            logs.set(iso, buildPmsLog(iso, offset));
        }

        const midpointIso = addDays(cycleStart, Math.max(6, Math.floor(cycleLength / 2)));
        if (midpointIso <= todayIso && !logs.has(midpointIso)) {
            logs.set(midpointIso, buildMidCycleLog(midpointIso, cycleIndex));
        }
    });

    return Array.from(logs.values()).sort((left, right) => left.date.localeCompare(right.date));
}

function buildMoodCheckIns(todayIso: string, cycleStarts: string[], dailyLogs: DailyLog[]) {
    const dailyLogMap = new Map(dailyLogs.map((log) => [log.date, log]));
    const checkIns: MoodCheckIn[] = [];

    cycleStarts.forEach((cycleStart, cycleIndex) => {
        const cycleLength = CYCLE_LENGTHS[cycleIndex] ?? 29;

        for (let offset = 0; offset < cycleLength; offset += 2) {
            const iso = addDays(cycleStart, offset);
            if (iso > todayIso) {
                break;
            }

            checkIns.push(buildCheckIn(iso, offset, cycleLength, dailyLogMap.get(iso), cycleIndex));
        }
    });

    return checkIns.sort((left, right) => left.datetime.localeCompare(right.datetime));
}

function buildPeriodLog(date: string, dayOffset: number, periodLength: number): DailyLog {
    const bleedingLevel = PERIOD_FLOW[Math.min(dayOffset, PERIOD_FLOW.length - 1)] ?? "light";
    const symptoms =
        dayOffset <= 2 ? (["cramps", "bloating"] satisfies SymptomKey[]) : (["cramps"] satisfies SymptomKey[]);

    return {
        date,
        bleedingLevel,
        symptoms,
        notes: dayOffset === 0 ? "Inicio claro de periodo." : dayOffset === periodLength - 1 ? "Ya va cerrando." : null,
        source: "observed",
        details: {
            periodStarted: dayOffset === 0,
            periodEnded: dayOffset === periodLength - 1,
            clotSize: dayOffset <= 1 ? "small" : "none",
            painImpact: dayOffset <= 1 ? "limits_day" : dayOffset === 2 ? "noticeable" : "none",
            painLocations: dayOffset <= 2 ? ["lower_abdomen", "lower_back"] : ["lower_abdomen"],
            symptomIntensities: {
                cramps: dayOffset <= 1 ? 4 : 3,
                ...(dayOffset <= 2 ? { bloating: 3 } : {}),
            },
            breastSensitivity: dayOffset === 0 ? 1 : undefined,
            medicationName: dayOffset <= 1 ? "Ibuprofeno" : null,
            medicationRelief: dayOffset === 0 ? "partly_helped" : dayOffset === 1 ? "helped" : "not_applicable",
        },
        updatedAt: `${date}T20:45:00.000Z`,
    };
}

function buildFertileLog(date: string, fertileOffset: number): DailyLog {
    return {
        date,
        bleedingLevel: "none",
        symptoms: fertileOffset === 1 ? ["breast_tenderness"] : [],
        notes: fertileOffset === 1 ? "Me sentí con más energía y más pendiente de ventana fértil." : null,
        source: "observed",
        details: {
            libidoLevel: fertileOffset === 1 ? "high" : "steady",
            symptomIntensities: fertileOffset === 1 ? { breast_tenderness: 2 } : undefined,
            breastSensitivity: fertileOffset === 1 ? 2 : undefined,
        },
        updatedAt: `${date}T18:20:00.000Z`,
    };
}

function buildPmsLog(date: string, daysBeforePeriod: number): DailyLog {
    const isStarting = daysBeforePeriod === 4;
    const symptoms: SymptomKey[] = isStarting ? ["bloating", "cravings"] : ["bloating", "cravings", "acne"];

    return {
        date,
        bleedingLevel: "none",
        symptoms,
        notes: isStarting ? "SPM empezando suave." : "Más sensibilidad y antojos estos días.",
        source: "observed",
        details: {
            pmsState: isStarting ? "starting" : "present",
            symptomIntensities: {
                bloating: 3,
                cravings: 3,
                ...(isStarting ? {} : { acne: 2 }),
            },
            breastSensitivity: isStarting ? 1 : 2,
            libidoLevel: "low",
        },
        updatedAt: `${date}T21:10:00.000Z`,
    };
}

function buildMidCycleLog(date: string, cycleIndex: number): DailyLog {
    const includeMigraine = cycleIndex % 3 === 1;

    return {
        date,
        bleedingLevel: "none",
        symptoms: includeMigraine ? ["migraine", "insomnia"] : ["insomnia"],
        notes: includeMigraine
            ? "Día largo, costó dormir y apareció dolor de cabeza."
            : "Dormí más liviano de lo normal.",
        source: "observed",
        details: {
            symptomIntensities: includeMigraine ? { migraine: 3, insomnia: 2 } : { insomnia: 2 },
        },
        updatedAt: `${date}T22:05:00.000Z`,
    };
}

function buildCheckIn(
    iso: string,
    dayOffset: number,
    cycleLength: number,
    log: DailyLog | undefined,
    cycleIndex: number,
): MoodCheckIn {
    const isPeriodDay = Boolean(log?.bleedingLevel && log.bleedingLevel !== "none");
    const isPmsDay = log?.details?.pmsState === "starting" || log?.details?.pmsState === "present";
    const fertileWindowStart = Math.max(8, cycleLength - 19);
    const isFertileWindow = dayOffset >= fertileWindowStart && dayOffset <= fertileWindowStart + 3;
    const baseTime = cycleIndex % 2 === 0 ? "08:40:00.000Z" : "20:10:00.000Z";

    if (isPeriodDay) {
        return {
            datetime: `${iso}T09:10:00.000Z`,
            momentType: "now",
            mood: 2,
            energy: 2,
            pain: log?.details?.painImpact === "limits_day" ? 4 : 3,
            breastSensitivity: log?.details?.breastSensitivity ?? 0,
            stress: 3,
            note: dayOffset === 0 ? "Primer día pesado." : "Dolor más llevadero que ayer.",
        };
    }

    if (isPmsDay) {
        return {
            datetime: `${iso}T19:45:00.000Z`,
            momentType: "now",
            mood: 2,
            energy: 2,
            pain: 2,
            breastSensitivity: log?.details?.breastSensitivity ?? 1,
            stress: 4,
            note: "Más sensible y con menos paciencia.",
        };
    }

    if (isFertileWindow) {
        return {
            datetime: `${iso}T12:20:00.000Z`,
            momentType: "now",
            mood: 4,
            energy: 4,
            pain: 1,
            breastSensitivity: log?.details?.breastSensitivity ?? 0,
            stress: 2,
            note: dayOffset === fertileWindowStart + 1 ? "Me sentí con más energía hoy." : null,
        };
    }

    return {
        datetime: `${iso}${baseTime}`,
        momentType: "now",
        mood: cycleIndex % 3 === 0 ? 4 : 3,
        energy: cycleIndex % 4 === 0 ? 4 : 3,
        pain: log?.symptoms.includes("migraine") ? 2 : 1,
        breastSensitivity: log?.details?.breastSensitivity ?? 0,
        stress: cycleIndex % 5 === 0 ? 3 : 2,
        note: log?.symptoms.includes("migraine") ? "Día raro, pero manejable." : null,
    };
}
