import { and, desc, eq, isNull } from "drizzle-orm";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { medicationCatalog } from "@/db/schema/medicationCatalog";

import type { CheckinDraft, DraftMedication, DraftSymptom } from "../types/CheckinDraft";

export type GetLastCheckinOfDayParams = {
    profileId: string;
    /** `YYYY-MM-DD` local del día a consultar. */
    localDate: string;
};

/**
 * Fragmento del draft reconstruido a partir del último check-in del día. Se usa
 * para prefilar el wizard al reabrir (Fase 4: valores del último check-in como
 * punto de partida). Omite `localDate` (el draft siempre usa la fecha de hoy) y
 * `activeStep` (control de navegación, no dato).
 */
export type CheckinSnapshot = Omit<Partial<CheckinDraft>, "localDate" | "activeStep">;

/**
 * Carga el check-in más reciente de un día concreto para un perfil, junto con
 * sus síntomas y medicamentos, y lo proyecta como `CheckinSnapshot` apto para
 * hidratar el draft del wizard.
 *
 * Usa el índice `ix_checkins_chronological` (`profile_id, recorded_at DESC,
 * deleted_at`). Si no hay ningún check-in ese día, devuelve `null`.
 *
 * Las relaciones sexuales (`intercourse_log`) **no** se incluyen en el snapshot:
 * son eventos first-class separados de `checkins` (sin FK directa) y no tiene
 * sentido repoblarlas como punto de partida — son puntuales, no recurrentes.
 */
export async function getLastCheckinOfDay(
    database: Database,
    params: GetLastCheckinOfDayParams,
): Promise<CheckinSnapshot | null> {
    const { profileId, localDate } = params;

    const row = await database
        .select()
        .from(checkin)
        .where(and(eq(checkin.profileId, profileId), eq(checkin.localDate, localDate), isNull(checkin.deletedAt)))
        .orderBy(desc(checkin.recordedAt))
        .limit(1)
        .then((rows) => rows.at(0) ?? null);

    if (!row) {
        return null;
    }

    const symptomRows = await database
        .select({
            symptomKey: checkinSymptom.symptomKey,
            intensity: checkinSymptom.intensity,
        })
        .from(checkinSymptom)
        .where(and(eq(checkinSymptom.checkinId, row.id), isNull(checkinSymptom.deletedAt)));

    const symptoms: DraftSymptom[] = symptomRows.map((s) => ({
        symptomKey: s.symptomKey,
        intensity: s.intensity,
    }));

    const medicationRows = await database
        .select({
            medicationId: checkinMedication.medicationId,
            name: medicationCatalog.name,
            relief: checkinMedication.relief,
            doseNote: checkinMedication.doseNote,
        })
        .from(checkinMedication)
        .innerJoin(medicationCatalog, eq(checkinMedication.medicationId, medicationCatalog.id))
        .where(and(eq(checkinMedication.checkinId, row.id), isNull(checkinMedication.deletedAt)));

    const medications: DraftMedication[] = medicationRows.map((m) => ({
        medicationId: m.medicationId,
        name: m.name ?? undefined,
        relief: m.relief ?? undefined,
        doseNote: m.doseNote ?? undefined,
    }));

    return {
        bleedingIntensity: row.bleedingIntensity,
        clots: row.clots,
        periodStatusSignal: row.periodStatusSignal,
        mood: row.mood,
        energy: row.energy,
        stressLevel: row.stressLevel,
        cervicalMucus: row.cervicalMucus,
        cervicalPosition: row.cervicalPosition,
        basalBodyTempC: row.basalBodyTempC,
        basalBodyTempTime: row.basalBodyTempTime,
        libido: row.libido,
        weightKg: row.weightKg,
        morningSickness: row.morningSickness,
        fetalMovement: row.fetalMovement,
        opkResult: row.opkResult,
        pregnancyTestResult: row.pregnancyTestResult,
        intercourse: null,
        symptoms,
        medications,
        note: row.note,
    };
}
