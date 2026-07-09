import { cyclePrediction, type InsertCyclePrediction } from "@/db/schema/cyclePrediction";
import type { RealDatabase } from "@test/utils/createRealDatabase";

import { profileSeed } from "./profileSeeder";

const defaultCyclePrediction: InsertCyclePrediction = {
    profileId: profileSeed.id,
    calculationDate: "2026-06-20",
    predictedNextStart: "2026-07-02",
    predictedOvulation: "2026-06-18",
    cycleLengthUsed: 28,
    confidence: "medium",
};

export const cyclePredictionSeed = {
    profileId: defaultCyclePrediction.profileId,
    calculationDate: defaultCyclePrediction.calculationDate,
};

export async function seedCyclePrediction(database: RealDatabase, overrides: Partial<InsertCyclePrediction> = {}) {
    const values: InsertCyclePrediction = {
        ...defaultCyclePrediction,
        ...overrides,
    };

    await database.db.insert(cyclePrediction).values(values);

    return values;
}
