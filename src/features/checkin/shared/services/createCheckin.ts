import { eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { intercourseLog } from "@/db/schema/intercourseLog";
import { medicationCatalog } from "@/db/schema/medicationCatalog";
import uuid from "@/db/utils/uuid";
import { recalculate } from "@/domain/engine/recalculate";

import type { CheckinDraft } from "../types/CheckinDraft";

export type CreateCheckinParams = {
    profileId: string;
    draft: CheckinDraft;
};

/** Normaliza un nombre de medicamento para deduplicar (minúsculas + trim). */
function normalizeMedicationName(name: string): string {
    return name.trim().toLowerCase();
}

/**
 * Persiste un check-in completo en una sola transacción (fila `checkins` +
 * síntomas + medicamentos + relaciones) y dispara el recálculo del motor desde
 * la fecha local del registro. Los medicamentos con nombre escrito a mano se
 * materializan (o reutilizan) en `medication_catalog` dentro de la misma
 * transacción.
 *
 * La señal de periodo (`periodStatusSignal`) se persiste como auditoría; la
 * apertura/cierre de rachas vive en el plan 03 y no se invoca aquí.
 *
 * Las relaciones sexuales se guardan como evento first-class en
 * `intercourse_log` (separado de `checkins`) cuando el draft lo declara.
 *
 * Devuelve el id del check-in creado, o `null` si el borrador no tenía nada
 * que persistir (día "nada que reportar").
 */
export async function createCheckin(database: Database, params: CreateCheckinParams): Promise<string | null> {
    const { profileId, draft } = params;
    const now = new Date().toISOString();
    const id = uuid();

    try {
        await database.transaction(async (tx) => {
            await tx.insert(checkin).values({
                id,
                profileId,
                recordedAt: now,
                localDate: draft.localDate,
                bleedingIntensity: draft.bleedingIntensity ?? undefined,
                clots: draft.clots ?? undefined,
                periodStatusSignal: draft.periodStatusSignal ?? undefined,
                mood: draft.mood ?? undefined,
                energy: draft.energy ?? undefined,
                stressLevel: draft.stressLevel ?? undefined,
                cervicalMucus: draft.cervicalMucus ?? undefined,
                cervicalPosition: draft.cervicalPosition ?? undefined,
                basalBodyTempC: draft.basalBodyTempC ?? undefined,
                basalBodyTempTime: draft.basalBodyTempTime ?? undefined,
                libido: draft.libido ?? undefined,
                weightKg: draft.weightKg ?? undefined,
                morningSickness: draft.morningSickness ?? undefined,
                fetalMovement: draft.fetalMovement ?? undefined,
                opkResult: draft.opkResult ?? undefined,
                pregnancyTestResult: draft.pregnancyTestResult ?? undefined,
                note: draft.note ?? undefined,
                createdAt: now,
                updatedAt: now,
            });

            for (const symptom of draft.symptoms) {
                await tx.insert(checkinSymptom).values({
                    checkinId: id,
                    symptomKey: symptom.symptomKey,
                    intensity: symptom.intensity,
                    createdAt: now,
                    updatedAt: now,
                });
            }

            for (const med of draft.medications) {
                let medicationId = med.medicationId;

                // Medicamento escrito a mano: reutiliza o crea en el catálogo
                // personal dentro de la misma transacción.
                if (!medicationId && med.name) {
                    const normalizedName = normalizeMedicationName(med.name);
                    const existing = await tx
                        .select({ id: medicationCatalog.id })
                        .from(medicationCatalog)
                        .where(eq(medicationCatalog.normalizedName, normalizedName))
                        .limit(1);
                    medicationId = existing.at(0)?.id;

                    if (!medicationId) {
                        medicationId = uuid();
                        await tx.insert(medicationCatalog).values({
                            id: medicationId,
                            profileId,
                            name: med.name.trim(),
                            normalizedName,
                            createdAt: now,
                            updatedAt: now,
                        });
                    }
                }

                if (!medicationId) {
                    throw new Error("createCheckin: medicamento sin medicationId ni name resolvable");
                }

                await tx.insert(checkinMedication).values({
                    id: uuid(),
                    checkinId: id,
                    medicationId,
                    takenAt: now,
                    relief: med.relief ?? undefined,
                    doseNote: med.doseNote ?? undefined,
                    createdAt: now,
                    updatedAt: now,
                });
            }

            // Relaciones: entidad first-class separada de `checkins`.
            // Se inserta solo si la usuaria declaró el evento (`intercourse !== null`).
            if (draft.intercourse !== null) {
                await tx.insert(intercourseLog).values({
                    id: uuid(),
                    profileId,
                    occurredAt: now,
                    localDate: draft.localDate,
                    isProtected: draft.intercourse.isProtected,
                    createdAt: now,
                    updatedAt: now,
                });
            }
        });
    } catch (error) {
        console.error("Error creating check-in:", error);
        throw error;
    }

    await recalculate(database, { profileId, from: draft.localDate });

    return id;
}
