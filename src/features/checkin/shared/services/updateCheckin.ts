import { and, eq, isNull, sql } from "drizzle-orm";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { medicationCatalog } from "@/db/schema/medicationCatalog";
import uuid from "@/db/utils/uuid";
import { recalculate } from "@/domain/engine/recalculate";

import type { CheckinDraft } from "../types/CheckinDraft";

export type UpdateCheckinParams = {
    profileId: string;
    checkinId: string;
    /** `localDate` original del registro, para decidir desde dónde recalcular. */
    previousLocalDate: string;
    draft: CheckinDraft;
};

/** Normaliza un nombre de medicamento para deduplicar (minúsculas + trim). */
function normalizeMedicationName(name: string): string {
    return name.trim().toLowerCase();
}

/**
 * Sustituye por completo el contenido de un check-in existente: actualiza la
 * fila de `checkins` (preservando `recordedAt` y `createdAt`), soft-deleleta
 * todos los síntomas y medicamentos previos, e inserta los nuevos. Todo en una
 * transacción. Tras commitear, el motor recalcula desde la fecha más antigua
 * entre la previa y la nueva (por si el draft cambiara el `localDate`).
 *
 * `intercourse_log` no se toca (entidad first-class sin FK al checkin; fuera
 * del alcance de la edición).
 *
 * Lanza error si el registro no existe o está borrado.
 */
export async function updateCheckin(database: Database, params: UpdateCheckinParams): Promise<void> {
    const { profileId, checkinId, draft } = params;
    const now = new Date().toISOString();

    const existing = await database
        .select({ id: checkin.id })
        .from(checkin)
        .where(
            and(
                eq(checkin.id, checkinId),
                eq(checkin.profileId, profileId),
                isNull(checkin.deletedAt),
            ),
        )
        .limit(1);

    if (existing.length === 0) {
        throw new Error(`updateCheckin: registro ${checkinId} no encontrado o borrado`);
    }

    await database.transaction(async (tx) => {
        await tx
            .update(checkin)
            .set({
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
                updatedAt: now,
                version: sql`${checkin.version} + 1`,
            })
            .where(and(eq(checkin.id, checkinId), eq(checkin.profileId, profileId)));

        // Soft-delete de síntomas y medicamentos previos.
        await tx
            .update(checkinSymptom)
            .set({ deletedAt: now, updatedAt: now })
            .where(eq(checkinSymptom.checkinId, checkinId));
        await tx
            .update(checkinMedication)
            .set({ deletedAt: now, updatedAt: now })
            .where(eq(checkinMedication.checkinId, checkinId));

        // Inserta los nuevos síntomas.
        for (const symptom of draft.symptoms) {
            await tx.insert(checkinSymptom).values({
                checkinId,
                symptomKey: symptom.symptomKey,
                intensity: symptom.intensity,
                createdAt: now,
                updatedAt: now,
            });
        }

        // Inserta los nuevos medicamentos (mismo dedup de catálogo que createCheckin).
        for (const med of draft.medications) {
            let medicationId = med.medicationId;

            if (!medicationId && med.name) {
                const normalizedName = normalizeMedicationName(med.name);
                const found = await tx
                    .select({ id: medicationCatalog.id })
                    .from(medicationCatalog)
                    .where(eq(medicationCatalog.normalizedName, normalizedName))
                    .limit(1);
                medicationId = found.at(0)?.id;

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
                throw new Error("updateCheckin: medicamento sin medicationId ni name resolvable");
            }

            await tx.insert(checkinMedication).values({
                id: uuid(),
                checkinId,
                medicationId,
                takenAt: now,
                relief: med.relief ?? undefined,
                doseNote: med.doseNote ?? undefined,
                createdAt: now,
                updatedAt: now,
            });
        }
    });

    const earliest = params.previousLocalDate < draft.localDate ? params.previousLocalDate : draft.localDate;
    await recalculate(database, { profileId, from: earliest });
}
