import { checkin, type InsertCheckin } from "@/db/schema/checkin";
import type { RealDatabase } from "@test/utils/createRealDatabase";

import { profileSeed } from "./profileSeeder";

const defaultCheckin: InsertCheckin = {
    id: "checkin-1",
    profileId: profileSeed.id,
    recordedAt: "2026-06-02T10:30:00Z",
    localDate: "2026-06-02",
    mood: 4,
    energy: 3,
    createdAt: "2026-06-02T10:30:00Z",
    updatedAt: "2026-06-02T10:30:00Z",
};

export const checkinSeed = {
    id: defaultCheckin.id,
    profileId: defaultCheckin.profileId,
};

export async function seedCheckin(database: RealDatabase, overrides: Partial<InsertCheckin> = {}) {
    const values: InsertCheckin = {
        ...defaultCheckin,
        ...overrides,
    };

    await database.db.insert(checkin).values(values);

    return values;
}
