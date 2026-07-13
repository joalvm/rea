import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";

import type { Database } from "@/db/client";
import { symptomCatalog } from "@/db/schema/symptomCatalog";
import { getQuickOptions } from "@/features/checkin/shared/services/getQuickOptions";
import { type FileDatabase, createFileDatabase } from "@test/utils/createFileDatabase";

import { seedProfile } from "../db/seeders/profileSeeder";
import { seedReproductiveIntentHistory } from "../db/seeders/reproductiveIntentHistorySeeder";

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

const TS = "2026-01-01T00:00:00Z";

async function insertSymptom(
    db: Database,
    row: {
        symptomKey: string;
        groupKey: string;
        labelKey: string;
        applicableMode: string;
        uiPriority: number;
        isQuickOption: boolean;
        isActive: boolean;
    },
) {
    await db.insert(symptomCatalog).values({
        symptomKey: row.symptomKey,
        groupKey: row.groupKey as "pain",
        labelKey: row.labelKey,
        applicableMode: row.applicableMode as "all",
        uiPriority: row.uiPriority,
        isQuickOption: row.isQuickOption,
        isActive: row.isActive,
        createdAt: TS,
        updatedAt: TS,
    });
}

describe("Integración de getQuickOptions", () => {
    it("devuelve solo síntomas con isQuickOption=true e isActive=true", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        await insertSymptom(db, {
            symptomKey: "quick_a",
            groupKey: "pain",
            labelKey: "checkIn:symptoms.cramps",
            applicableMode: "all",
            uiPriority: 10,
            isQuickOption: true,
            isActive: true,
        });
        await insertSymptom(db, {
            symptomKey: "not_quick",
            groupKey: "pain",
            labelKey: "checkIn:symptoms.headache",
            applicableMode: "all",
            uiPriority: 20,
            isQuickOption: false,
            isActive: true,
        });
        await insertSymptom(db, {
            symptomKey: "inactive_quick",
            groupKey: "pain",
            labelKey: "checkIn:symptoms.migraine",
            applicableMode: "all",
            uiPriority: 30,
            isQuickOption: true,
            isActive: false,
        });

        const options = await getQuickOptions(db);

        expect(options).toHaveLength(1);
        expect(options[0]?.symptomKey).toBe("quick_a");
    });

    it("filtra por modo: en pregnancy_tracking incluye los del modo + los all", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        await insertSymptom(db, {
            symptomKey: "all_quick",
            groupKey: "pain",
            labelKey: "checkIn:symptoms.cramps",
            applicableMode: "all",
            uiPriority: 10,
            isQuickOption: true,
            isActive: true,
        });
        await insertSymptom(db, {
            symptomKey: "pregnancy_quick",
            groupKey: "digestive",
            labelKey: "checkIn:symptoms.heartburn",
            applicableMode: "pregnancy_tracking",
            uiPriority: 20,
            isQuickOption: true,
            isActive: true,
        });
        await insertSymptom(db, {
            symptomKey: "ttc_quick",
            groupKey: "pain",
            labelKey: "checkIn:symptoms.ovulationPain",
            applicableMode: "tracking_ttc",
            uiPriority: 30,
            isQuickOption: true,
            isActive: true,
        });

        const options = await getQuickOptions(db, { mode: "pregnancy_tracking" });

        expect(options).toHaveLength(2);
        expect(options.map((o) => o.symptomKey)).toEqual(["all_quick", "pregnancy_quick"]);
    });

    it("sin modo devuelve solo los all", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        await insertSymptom(db, {
            symptomKey: "all_quick",
            groupKey: "pain",
            labelKey: "checkIn:symptoms.cramps",
            applicableMode: "all",
            uiPriority: 10,
            isQuickOption: true,
            isActive: true,
        });
        await insertSymptom(db, {
            symptomKey: "pregnancy_quick",
            groupKey: "digestive",
            labelKey: "checkIn:symptoms.heartburn",
            applicableMode: "pregnancy_tracking",
            uiPriority: 5,
            isQuickOption: true,
            isActive: true,
        });

        const options = await getQuickOptions(db);

        expect(options).toHaveLength(1);
        expect(options[0]?.symptomKey).toBe("all_quick");
    });

    it("ordena por uiPriority ascendente", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        await insertSymptom(db, {
            symptomKey: "priority_high_num",
            groupKey: "pain",
            labelKey: "checkIn:symptoms.cramps",
            applicableMode: "all",
            uiPriority: 50,
            isQuickOption: true,
            isActive: true,
        });
        await insertSymptom(db, {
            symptomKey: "priority_low_num",
            groupKey: "pain",
            labelKey: "checkIn:symptoms.bloating",
            applicableMode: "all",
            uiPriority: 5,
            isQuickOption: true,
            isActive: true,
        });
        await insertSymptom(db, {
            symptomKey: "priority_mid",
            groupKey: "pain",
            labelKey: "checkIn:symptoms.nausea",
            applicableMode: "all",
            uiPriority: 20,
            isQuickOption: true,
            isActive: true,
        });

        const options = await getQuickOptions(db);

        expect(options.map((o) => o.symptomKey)).toEqual(["priority_low_num", "priority_mid", "priority_high_num"]);
    });
});
