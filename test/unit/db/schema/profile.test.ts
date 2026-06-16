import { describe, expect, it } from "@jest/globals";

import { profile } from "@/db/schema/profile";
import { checkNames, columnNames, tableName } from "@test/db/utils/schemaMetadata";

describe("profile schema", () => {
    it("defines the user_profile table contract", () => {
        expect(tableName(profile)).toBe("user_profile");
        expect(columnNames(profile)).toEqual([
            "id",
            "name",
            "birth_year",
            "reminders_enabled",
            "reminder_interval_hours",
            "reminder_window_start",
            "reminder_window_end",
            "onboarding_completed_at",
            "created_at",
            "updated_at",
            "version",
        ]);
    });

    it("keeps profile defaults in the Drizzle schema", () => {
        expect(profile.remindersEnabled.default).toBe(true);
        expect(profile.reminderIntervalHours.default).toBe(6);
        expect(profile.reminderWindowStart.default).toBe("09:00");
        expect(profile.reminderWindowEnd.default).toBe("22:00");
        expect(profile.version.default).toBe(1);
    });

    it("declares checks for reminder values", () => {
        expect(checkNames(profile)).toEqual([
            "birth_year_check",
            "reminders_enabled_check",
            "reminder_interval_hours_check",
            "reminder_window_start_check",
            "reminder_window_end_check",
        ]);
    });
});
