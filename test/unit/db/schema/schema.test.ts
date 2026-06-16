import { describe, expect, it } from "@jest/globals";

import {
    checkin,
    checkinMedication,
    checkinSymptom,
    contentDeliveryLog,
    contentItem,
    contentRule,
    contentSource,
    dailySummary,
    intercourseLog,
    medicationCatalog,
    periodRun,
    pregnancyEpisode,
    profile,
    reproductiveIntentHistory,
    schemaMigration,
    symptomCatalog,
} from "@/db/schema/schema";
import { tableName } from "@test/db/utils/schemaMetadata";

describe("database schema root", () => {
    it("exports every domain table from the root schema", () => {
        expect(
            [
                schemaMigration,
                profile,
                reproductiveIntentHistory,
                periodRun,
                pregnancyEpisode,
                symptomCatalog,
                medicationCatalog,
                checkin,
                checkinSymptom,
                checkinMedication,
                intercourseLog,
                dailySummary,
                contentSource,
                contentItem,
                contentRule,
                contentDeliveryLog,
            ].map(tableName),
        ).toEqual([
            "schema_migrations",
            "user_profile",
            "reproductive_intent_history",
            "period_runs",
            "pregnancy_episodes",
            "symptom_catalog",
            "medication_catalog",
            "checkins",
            "checkin_symptoms",
            "checkin_medications",
            "intercourse_log",
            "daily_summary",
            "content_sources",
            "content_items",
            "content_rules",
            "content_delivery_log",
        ]);
    });
});
