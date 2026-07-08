import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { and, eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { cyclePrediction } from "@/db/schema/cyclePrediction";
import { cycleRecord } from "@/db/schema/cycleRecord";
import { dailySummary } from "@/db/schema/dailySummary";
import { periodRun } from "@/db/schema/periodRun";
import { addDays } from "@/domain/cycle/utils/addDays";
import { recalculate } from "@/domain/engine/recalculate";
import { seedPeriodRun } from "@test/integration/db/seeders/periodRunSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { seedReproductiveIntentHistory } from "@test/integration/db/seeders/reproductiveIntentHistorySeeder";
import { type FileDatabase, createFileDatabase } from "@test/utils/createFileDatabase";

let database: FileDatabase | null = null;

beforeEach(async () => {
    database = await createFileDatabase();
});
afterEach(() => {
    database?.close();
    database = null;
});

const context = {
    get database() {
        if (database == null) {
            throw new Error("se accedió a la base de datos de archivo antes de inicializarla");
        }
        return database;
    },
};

function todayLocalISO(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

async function currentPrediction(db: Database, today: string) {
    const rows = await db
        .select()
        .from(cyclePrediction)
        .where(and(eq(cyclePrediction.profileId, profileSeed.id), eq(cyclePrediction.calculationDate, today)));
    return rows.at(0) ?? null;
}

// 4 ciclos de 28 días, espaciados para que el cierre del 2do (validCycleCount=2)
// y el 3ro (validCycleCount=3) caigan sin retraso respecto al reloj real de la
// máquina de test — así la confianza sube por muestra, no se enmascara por retraso.
const today = todayLocalISO();
const cycle1Start = addDays(today, -84);
const cycle2Start = addDays(today, -56);
const cycle3Start = addDays(today, -28);
const cycle4Start = today;

describe("Integración de recalculate: secuencia de 4 ciclos", () => {
    it("cierra cada ciclo con prediction_error_days correcto y sube la confianza según la muestra", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database, {
            effectiveFrom: "2000-01-01",
            declaredCycleLength: 30,
            declaredPeriodLength: 5,
        });

        // Llamada A: primer periodo, todavía abierto.
        await seedPeriodRun(context.database, {
            id: "run-1",
            startDate: cycle1Start,
            endDate: undefined,
            status: "open",
        });
        await recalculate(db, { profileId: profileSeed.id, from: cycle1Start });

        let records = await db.select().from(cycleRecord).where(eq(cycleRecord.profileId, profileSeed.id));
        expect(records).toHaveLength(0);

        let prediction = await currentPrediction(db, today);
        expect(prediction?.confidence).toBe("low");
        expect(prediction?.cycleLengthUsed).toBe(30);

        // Llamada B: cierra el periodo 1, abre el periodo 2.
        await db
            .update(periodRun)
            .set({ endDate: addDays(cycle1Start, 4), status: "closed" })
            .where(eq(periodRun.id, "run-1"));
        await seedPeriodRun(context.database, {
            id: "run-2",
            startDate: cycle2Start,
            endDate: undefined,
            status: "open",
        });
        await recalculate(db, { profileId: profileSeed.id, from: cycle1Start });

        records = await db.select().from(cycleRecord).where(eq(cycleRecord.profileId, profileSeed.id));
        expect(records).toHaveLength(1);
        expect(records[0]).toMatchObject({ startDate: cycle1Start, endDate: addDays(cycle2Start, -1), cycleLength: 28 });

        prediction = await currentPrediction(db, today);
        expect(prediction?.confidence).toBe("low");

        // Predicción histórica sintética: simula que, mientras el ciclo 2 estaba
        // abierto, el motor ya había calculado (un día después de iniciar) que
        // duraría 30 días. Sin esto no hay forma de simular "el pasado" dentro de
        // una sola corrida de test (todas las llamadas ocurren el mismo `today`).
        await db.insert(cyclePrediction).values({
            profileId: profileSeed.id,
            calculationDate: addDays(cycle2Start, 1),
            predictedNextStart: addDays(cycle2Start, 30),
            cycleLengthUsed: 30,
            confidence: "low",
        });

        // Llamada C: cierra el periodo 2, abre el periodo 3. Cruza el umbral de
        // muestra (2 ciclos válidos) y ya no hay retraso: confianza sube a medium.
        await db
            .update(periodRun)
            .set({ endDate: addDays(cycle2Start, 4), status: "closed" })
            .where(eq(periodRun.id, "run-2"));
        await seedPeriodRun(context.database, {
            id: "run-3",
            startDate: cycle3Start,
            endDate: undefined,
            status: "open",
        });
        await recalculate(db, { profileId: profileSeed.id, from: cycle2Start });

        records = await db.select().from(cycleRecord).where(eq(cycleRecord.profileId, profileSeed.id));
        expect(records).toHaveLength(2);
        const cycle2Record = records.find((record) => record.startDate === cycle2Start);
        // El cierre real fue en cycle3Start (28 días); la predicción vigente antes
        // de eso apostaba por 30 (cycle2Start+30) → error = 28 - 30 = -2.
        expect(cycle2Record?.predictedStart).toBe(addDays(cycle2Start, 30));
        expect(cycle2Record?.predictionErrorDays).toBe(-2);

        prediction = await currentPrediction(db, today);
        expect(prediction?.confidence).toBe("medium");
        expect(prediction?.cycleLengthUsed).toBe(28);

        // Llamada D: cierra el periodo 3, abre el periodo 4 (hoy). 3 ciclos válidos.
        await db
            .update(periodRun)
            .set({ endDate: addDays(cycle3Start, 4), status: "closed" })
            .where(eq(periodRun.id, "run-3"));
        await seedPeriodRun(context.database, {
            id: "run-4",
            startDate: cycle4Start,
            endDate: undefined,
            status: "open",
        });
        await recalculate(db, { profileId: profileSeed.id, from: cycle3Start });

        records = await db.select().from(cycleRecord).where(eq(cycleRecord.profileId, profileSeed.id));
        expect(records).toHaveLength(3);

        prediction = await currentPrediction(db, today);
        expect(prediction?.confidence).toBe("medium");
        expect(prediction?.predictedNextStart).toBe(addDays(cycle4Start, 28));

        const summaries = await db.select().from(dailySummary).where(eq(dailySummary.profileId, profileSeed.id));
        expect(summaries.length).toBeGreaterThan(0);
        const cycle1FirstDay = summaries.find((row) => row.localDate === cycle1Start);
        expect(cycle1FirstDay).toMatchObject({ isMenstruationDay: true, menstruationBasis: "confirmed_period" });

        // Editar retroactivamente el periodo 1 (se extiende de 5 a 7 días) repara
        // esa fila de cycle_records (mismo id, sin duplicar) y el daily_summary
        // del rango, sin tocar los ciclos posteriores.
        await db
            .update(periodRun)
            .set({ endDate: addDays(cycle1Start, 6) })
            .where(eq(periodRun.id, "run-1"));
        await recalculate(db, { profileId: profileSeed.id, from: cycle1Start });

        records = await db.select().from(cycleRecord).where(eq(cycleRecord.profileId, profileSeed.id));
        expect(records).toHaveLength(3);
        const repairedCycle1 = records.find((record) => record.startDate === cycle1Start);
        expect(repairedCycle1?.periodLength).toBe(7);

        const extendedDay = await db
            .select()
            .from(dailySummary)
            .where(eq(dailySummary.localDate, addDays(cycle1Start, 5)));
        expect(extendedDay[0]).toMatchObject({ isMenstruationDay: true, menstruationBasis: "confirmed_period" });
    });
});
