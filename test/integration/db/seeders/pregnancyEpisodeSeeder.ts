import { pregnancyEpisode, type InsertPregnancyEpisode } from "@/db/schema/pregnancyEpisode";
import type { RealDatabase } from "@test/utils/createRealDatabase";

import { profileSeed } from "./profileSeeder";

const defaultPregnancyEpisode: InsertPregnancyEpisode = {
    id: "pregnancy-1",
    profileId: profileSeed.id,
    lmpDate: "2026-03-01",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
};

export const pregnancyEpisodeSeed = {
    id: defaultPregnancyEpisode.id,
    profileId: defaultPregnancyEpisode.profileId,
};

export async function seedPregnancyEpisode(database: RealDatabase, overrides: Partial<InsertPregnancyEpisode> = {}) {
    const values: InsertPregnancyEpisode = {
        ...defaultPregnancyEpisode,
        ...overrides,
    };

    await database.db.insert(pregnancyEpisode).values(values);

    return values;
}
