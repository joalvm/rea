import { describe, expect, it } from "@jest/globals";

import {
    appSettings,
    checkin,
    checkinMedication,
    checkinSymptom,
    contentDeliveryLog,
    contentItem,
    contentRule,
    contentSource,
    cyclePrediction,
    cycleRecord,
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

describe("Raíz del esquema de base de datos", () => {
    it("exporta todas las tablas de dominio desde el esquema raíz", () => {
        expect(
            [
                schemaMigration,
                profile,
                appSettings,
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
                cyclePrediction,
                cycleRecord,
                contentSource,
                contentItem,
                contentRule,
                contentDeliveryLog,
            ].map(tableName),
        ).toEqual([
            "schema_migrations",
            "user_profile",
            "app_settings",
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
            "cycle_predictions",
            "cycle_records",
            "content_sources",
            "content_items",
            "content_rules",
            "content_delivery_log",
        ]);
    });
});
