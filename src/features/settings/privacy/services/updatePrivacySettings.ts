import { eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { appSettings } from "@/db/schema/appSettings";

export async function updatePrivacySettings(database: Database, userId: string, discreetCalendar: boolean) {
    await database
        .update(appSettings)
        .set({ discreetCalendar, updatedAt: new Date().toISOString() })
        .where(eq(appSettings.userId, userId));
}
