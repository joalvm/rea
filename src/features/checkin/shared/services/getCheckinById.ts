import { and, eq, isNull } from "drizzle-orm";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { medicationCatalog } from "@/db/schema/medicationCatalog";

import type { DraftMedication, DraftSymptom } from "../types/CheckinDraft";
import type { CheckinSnapshot } from "./getLastCheckinOfDay";

export type GetCheckinByIdParams = {
    profileId: string;
    checkinId: string;
};

export type CheckinRecord = {
    id: string;
    localDate: string;
    recordedAt: string;
    snapshot: CheckinSnapshot;
};

/**
 * Carga un check-in por id (con síntomas y medicamentos) y lo proyecta como
 * `CheckinSnapshot` apto para hidratar el draft del wizard en modo edición.
 *
 * A diferencia de `getLastCheckinOfDay` (que ordena por `recordedAt` y limita
 * 1), aquí filtramos por `id` exacto. Excluye filas soft-deleted.
 *
 * `intercourse` no se incluye (entidad first-class sin FK al checkin; fuera del
 * alcance de la edición).
 *
 * Devuelve `null` si el registro no existe o está borrado.
 */
export async function getCheckinById(
    database: Database,
    params: GetCheckinByIdParams,
): Promise<CheckinRecord | null> {
    const row = await database
        .select()
        .from(checkin)
        .where(
            and(
                eq(checkin.id, params.checkinId),
                eq(checkin.profileId, params.profileId),
                isNull(checkin.deletedAt),
            ),
        )
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
        id: row.id,
        localDate: row.localDate,
        recordedAt: row.recordedAt,
        snapshot: {
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
        },
    };
}
