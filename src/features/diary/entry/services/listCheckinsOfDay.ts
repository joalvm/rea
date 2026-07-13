import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { medicationCatalog } from "@/db/schema/medicationCatalog";

export type ListCheckinsOfDayParams = {
    profileId: string;
    /** `YYYY-MM-DD` del día a consultar. */
    localDate: string;
};

/**
 * Síntoma proyectado del detalle de un check-in.
 */
export type DetailSymptom = {
    symptomKey: string;
    intensity: number;
};

/**
 * Medicamento proyectado del detalle de un check-in. `name` viene del catálogo
 * (`medicationCatalog`) vía inner join.
 */
export type DetailMedication = {
    medicationId: string;
    name: string | null;
    relief: number | null;
};

/**
 * Detalle completo de un check-in para la línea de tiempo del diario: métricas
 * clave + síntomas + medicamentos. Es la unidad que se renderiza como ítem del
 * timeline en `DiaryEntryScreen`.
 */
export type CheckinDetail = {
    id: string;
    recordedAt: string;
    note: string | null;
    bleedingIntensity: number | null;
    mood: number | null;
    energy: number | null;
    periodStatusSignal: string | null;
    excludedFromSummary: number;
    symptoms: DetailSymptom[];
    medications: DetailMedication[];
};

/**
 * Carga todos los check-ins de un día concreto para un perfil, junto con sus
 * síntomas y medicamentos, y los devuelve como `CheckinDetail[]` ordenados desc
 * por `recordedAt`. Excluye los soft-deleted en todas las tablas.
 *
 * Patrón multi-query (extiende `getLastCheckinOfDay` a N filas):
 * 1. Check-ins del día (`isNull(deletedAt)`), orden desc por `recordedAt`.
 * 2. Síntomas de esos check-ins vía `inArray(checkinId, ids)`.
 * 3. Medicamentos vía `innerJoin(medicationCatalog)` para resolver el nombre.
 *
 * Si no hay check-ins en el día devuelve `[]`.
 */
export async function listCheckinsOfDay(
    database: Database,
    params: ListCheckinsOfDayParams,
): Promise<CheckinDetail[]> {
    const { profileId, localDate } = params;

    const checkinRows = await database
        .select({
            id: checkin.id,
            recordedAt: checkin.recordedAt,
            note: checkin.note,
            bleedingIntensity: checkin.bleedingIntensity,
            mood: checkin.mood,
            energy: checkin.energy,
            periodStatusSignal: checkin.periodStatusSignal,
            excludedFromSummary: checkin.excludedFromSummary,
        })
        .from(checkin)
        .where(and(eq(checkin.profileId, profileId), eq(checkin.localDate, localDate), isNull(checkin.deletedAt)))
        .orderBy(desc(checkin.recordedAt));

    if (checkinRows.length === 0) {
        return [];
    }

    const ids = checkinRows.map((row) => row.id);

    const symptomRows = await database
        .select({
            checkinId: checkinSymptom.checkinId,
            symptomKey: checkinSymptom.symptomKey,
            intensity: checkinSymptom.intensity,
        })
        .from(checkinSymptom)
        .where(and(inArray(checkinSymptom.checkinId, ids), isNull(checkinSymptom.deletedAt)));

    const medicationRows = await database
        .select({
            checkinId: checkinMedication.checkinId,
            medicationId: checkinMedication.medicationId,
            name: medicationCatalog.name,
            relief: checkinMedication.relief,
        })
        .from(checkinMedication)
        .innerJoin(medicationCatalog, eq(checkinMedication.medicationId, medicationCatalog.id))
        .where(and(inArray(checkinMedication.checkinId, ids), isNull(checkinMedication.deletedAt)));

    const symptomsByCheckin = new Map<string, DetailSymptom[]>();
    for (const s of symptomRows) {
        const bucket = symptomsByCheckin.get(s.checkinId);
        if (bucket) {
            bucket.push({ symptomKey: s.symptomKey, intensity: s.intensity });
        } else {
            symptomsByCheckin.set(s.checkinId, [{ symptomKey: s.symptomKey, intensity: s.intensity }]);
        }
    }

    const medicationsByCheckin = new Map<string, DetailMedication[]>();
    for (const m of medicationRows) {
        const bucket = medicationsByCheckin.get(m.checkinId);
        if (bucket) {
            bucket.push({ medicationId: m.medicationId, name: m.name, relief: m.relief });
        } else {
            medicationsByCheckin.set(m.checkinId, [{ medicationId: m.medicationId, name: m.name, relief: m.relief }]);
        }
    }

    return checkinRows.map((row) => ({
        id: row.id,
        recordedAt: row.recordedAt,
        note: row.note,
        bleedingIntensity: row.bleedingIntensity,
        mood: row.mood,
        energy: row.energy,
        periodStatusSignal: row.periodStatusSignal,
        excludedFromSummary: row.excludedFromSummary,
        symptoms: symptomsByCheckin.get(row.id) ?? [],
        medications: medicationsByCheckin.get(row.id) ?? [],
    }));
}
