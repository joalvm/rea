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
    medicationCatalog,
    periodRun,
    profile,
    reproductiveIntentHistory,
    symptomCatalog,
} from "@/db/schema/schema";
import { tableName } from "@test/db/utils/schemaMetadata";

describe("database schema root", () => {
    it("exports every domain table from the root schema", () => {
        expect(
            [
                profile,
                reproductiveIntentHistory,
                periodRun,
                symptomCatalog,
                medicationCatalog,
                checkin,
                checkinSymptom,
                checkinMedication,
                dailySummary,
                contentSource,
                contentItem,
                contentRule,
                contentDeliveryLog,
            ].map(tableName),
        ).toEqual([
            "user_profile",
            "reproductive_intent_history",
            "period_runs",
            "symptom_catalog",
            "medication_catalog",
            "checkins",
            "checkin_symptoms",
            "checkin_medications",
            "daily_summary",
            "content_sources",
            "content_items",
            "content_rules",
            "content_delivery_log",
        ]);
    });
});
