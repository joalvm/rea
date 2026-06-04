import getDatabase from "../connection";
import { getActiveProfileId } from "./profileState";

/** Regenera read model diario desde eventos canonicos observados. */
export default async function recalculateDailySummary(localDate: string) {
    const database = await getDatabase();
    const userId = await getActiveProfileId();
    if (!userId) {
        return;
    }

    await database.runAsync(
        `INSERT INTO daily_summary (
            local_date,
            user_id,
            is_menstruation_day,
            menstruation_basis,
            is_spotting_day,
            had_medication,
            avg_mood,
            avg_energy,
            avg_stress,
            max_pain,
            max_symptom_intensity,
            top_symptom_key,
            medication_relief_score,
            estimated_phase,
            phase_source,
            phase_confidence,
            updated_at
        )
        WITH checkin_metrics AS (
            SELECT
                MAX(CASE WHEN bleeding_intensity >= 2 THEN 1 ELSE 0 END) AS is_menstruation_day,
                MAX(CASE WHEN bleeding_intensity = 1 THEN 1 ELSE 0 END) AS is_spotting_day,
                AVG(mood) AS avg_mood,
                AVG(energy) AS avg_energy,
                AVG(stress_level) AS avg_stress,
                MAX(pain_intensity) AS max_pain
            FROM checkins
            WHERE user_id = ? AND local_date = ? AND deleted_at IS NULL
        ),
        period_metrics AS (
            SELECT COUNT(id) > 0 AS is_confirmed_period_day
            FROM period_runs
            WHERE user_id = ?
              AND deleted_at IS NULL
              AND status != 'excluded'
              AND source IN ('user_confirmed', 'mixed')
              AND start_date <= ?
              AND (end_date IS NULL OR end_date >= ?)
        ),
        symptom_metrics AS (
            SELECT symptom_key, MAX(intensity) AS max_intensity
            FROM checkin_symptoms
            INNER JOIN checkins ON checkins.id = checkin_symptoms.checkin_id
            WHERE checkins.user_id = ?
              AND checkins.local_date = ?
              AND checkins.deleted_at IS NULL
              AND checkin_symptoms.deleted_at IS NULL
            GROUP BY symptom_key
            ORDER BY max_intensity DESC, symptom_key ASC
            LIMIT 1
        ),
        medication_metrics AS (
            SELECT
                COUNT(checkin_medications.id) > 0 AS had_medication,
                AVG(checkin_medications.relief) AS medication_relief_score
            FROM checkin_medications
            INNER JOIN checkins ON checkins.id = checkin_medications.checkin_id
            WHERE checkins.user_id = ?
              AND checkins.local_date = ?
              AND checkins.deleted_at IS NULL
              AND checkin_medications.deleted_at IS NULL
        )
        SELECT
            ?,
            ?,
            CASE
                WHEN COALESCE(period_metrics.is_confirmed_period_day, 0) = 1 THEN 1
                ELSE COALESCE(checkin_metrics.is_menstruation_day, 0)
            END,
            CASE WHEN COALESCE(period_metrics.is_confirmed_period_day, 0) = 1
                 THEN 'confirmed_period'
                 WHEN COALESCE(checkin_metrics.is_menstruation_day, 0) = 1
                 THEN 'inferred_bleeding'
                 ELSE 'none'
            END,
            CASE
                WHEN COALESCE(period_metrics.is_confirmed_period_day, 0) = 1 THEN 0
                ELSE COALESCE(checkin_metrics.is_spotting_day, 0)
            END,
            COALESCE(medication_metrics.had_medication, 0),
            checkin_metrics.avg_mood,
            checkin_metrics.avg_energy,
            checkin_metrics.avg_stress,
            checkin_metrics.max_pain,
            COALESCE(symptom_metrics.max_intensity, 0),
            symptom_metrics.symptom_key,
            medication_metrics.medication_relief_score,
            'unknown',
            'unknown',
            'low',
            ?
        FROM checkin_metrics
        LEFT JOIN period_metrics ON 1 = 1
        LEFT JOIN symptom_metrics ON 1 = 1
        LEFT JOIN medication_metrics ON 1 = 1
        ON CONFLICT(user_id, local_date) DO UPDATE SET
            is_menstruation_day = excluded.is_menstruation_day,
            menstruation_basis = excluded.menstruation_basis,
            is_spotting_day = excluded.is_spotting_day,
            had_medication = excluded.had_medication,
            avg_mood = excluded.avg_mood,
            avg_energy = excluded.avg_energy,
            avg_stress = excluded.avg_stress,
            max_pain = excluded.max_pain,
            max_symptom_intensity = excluded.max_symptom_intensity,
            top_symptom_key = excluded.top_symptom_key,
            medication_relief_score = excluded.medication_relief_score,
            updated_at = excluded.updated_at`,
        userId,
        localDate,
        userId,
        localDate,
        localDate,
        userId,
        localDate,
        userId,
        localDate,
        localDate,
        userId,
        new Date().toISOString(),
    );
}
