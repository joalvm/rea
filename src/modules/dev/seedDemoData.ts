import type { SQLiteDatabase } from "expo-sqlite";

import type { Database } from "@/db/client";
import { resetDatabase } from "@/db/initializeDatabase";
import { createCheckin } from "@/features/checkin/shared/services/createCheckin";
import { completeOnboarding } from "@/features/onboarding/complete/services/completeOnboarding";
import type { CheckinDraft } from "@/features/checkin/shared/types/CheckinDraft";
import type { OnboardingDraft } from "@/features/onboarding/shared/types/OnboardingDraft";

/**
 * Sembrado de demo para verificación visual (Maestro) en builds de desarrollo.
 *
 * Restablece la base de datos y materializa un perfil con onboarding cerrado,
 * un periodo reciente y varios check-ins en días distintos, de modo que el
 * diario y la lista de registros muestren datos realistas sin necesidad de
 * conducir todo el flujo de onboarding a través de `inputText` (que no escribe
 * en `TextInput` controlado en el emulador API 36).
 *
 * Solo debe invocarse desde un punto de entrada bajo `__DEV__` (p. ej. una ruta
 * de dev oculta). Nunca llega a producción.
 */

function localISODate(daysAgo: number): string {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function buildOnboardingDraft(): OnboardingDraft {
    return {
        name: "Rea",
        birthYear: 1995,
        intent: { reproductiveMode: "tracking_only" },
        // Periodo iniciado hace 3 días, aún en curso (genera racha abierta).
        lastPeriodStart: localISODate(3),
        lastPeriodOngoing: true,
        lastPeriodEnd: null,
        cycleLength: 28,
        periodLength: 5,
        regularity: "regular",
        regularitySelection: "regular",
        contraceptionMethod: null,
        pregnancyLmp: null,
        pregnancyDueDate: null,
        pregnancyDatingBasis: "lmp",
        remindersEnabled: false,
        reminderWindowStart: "09:00",
        reminderWindowEnd: "21:00",
        reminderIntervalHours: 12,
    };
}

function draftFor(date: string, overrides: Partial<CheckinDraft>): CheckinDraft {
    return {
        localDate: date,
        activeStep: 0,
        bleedingIntensity: null,
        clots: null,
        periodStatusSignal: null,
        mood: null,
        energy: null,
        stressLevel: null,
        cervicalMucus: null,
        cervicalPosition: null,
        basalBodyTempC: null,
        basalBodyTempTime: null,
        libido: null,
        weightKg: null,
        morningSickness: null,
        fetalMovement: null,
        opkResult: null,
        pregnancyTestResult: null,
        intercourse: null,
        symptoms: [],
        medications: [],
        note: null,
        ...overrides,
    };
}

/**
 * Siembra datos de demo en la base de datos local.
 *
 * @param rawConnection Conexión cruda de expo-sqlite (para `resetDatabase`).
 * @param database Instancia Drizzle (para `completeOnboarding` / `createCheckin`).
 */
export async function seedDemoData(rawConnection: SQLiteDatabase, database: Database): Promise<void> {
    await resetDatabase(rawConnection);

    const profileId = await completeOnboarding(database, buildOnboardingDraft());

    // Check-ins variados sobre los últimos días.
    await createCheckin(database, {
        profileId,
        draft: draftFor(localISODate(3), {
            bleedingIntensity: 2,
            periodStatusSignal: "started",
            mood: 3,
            note: "Primer día de regla",
        }),
    });

    await createCheckin(database, {
        profileId,
        draft: draftFor(localISODate(1), {
            bleedingIntensity: 3,
            mood: 2,
            energy: 2,
            symptoms: [
                { symptomKey: "cramps", intensity: 4 },
                { symptomKey: "headache", intensity: 2 },
            ],
        }),
    });

    await createCheckin(database, {
        profileId,
        draft: draftFor(localISODate(0), {
            bleedingIntensity: 2,
            mood: 4,
            energy: 3,
            note: "Hoy me siento mejor",
        }),
    });
}
