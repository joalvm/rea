import { MoodCheckIn } from "@/types/records.types";

import db from "../core/database";

/** Mantiene alias semántico para creación de anotación puntual. */
export async function addMoodCheckIn(checkIn: MoodCheckIn) {
    await upsertMoodCheckIn(checkIn);
}

/** Inserta o actualiza anotación puntual de bienestar. */
export async function upsertMoodCheckIn(checkIn: MoodCheckIn) {
    if (checkIn.id) {
        await db().runAsync(
            "UPDATE mood_checkins SET datetime = ?, momentType = ?, mood = ?, energy = ?, pain = ?, breastSensitivity = ?, stress = ?, note = ? WHERE id = ?",
            checkIn.datetime,
            checkIn.momentType,
            checkIn.mood,
            checkIn.energy,
            checkIn.pain,
            checkIn.breastSensitivity,
            checkIn.stress,
            checkIn.note ?? null,
            checkIn.id,
        );
        return;
    }

    await db().runAsync(
        "INSERT INTO mood_checkins (datetime, momentType, mood, energy, pain, breastSensitivity, stress, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        checkIn.datetime,
        checkIn.momentType,
        checkIn.mood,
        checkIn.energy,
        checkIn.pain,
        checkIn.breastSensitivity,
        checkIn.stress,
        checkIn.note ?? null,
    );
}

/** Elimina anotación puntual concreta por id. */
export async function deleteMoodCheckIn(id: number) {
    await db().runAsync("DELETE FROM mood_checkins WHERE id = ?", id);
}

/** Carga últimas anotaciones puntuales guardadas. */
export async function loadMoodCheckIns(): Promise<MoodCheckIn[]> {
    return db().getAllAsync<MoodCheckIn>("SELECT * FROM mood_checkins ORDER BY datetime DESC LIMIT 200");
}
