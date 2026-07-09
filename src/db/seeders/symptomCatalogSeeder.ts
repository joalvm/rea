import type { InsertSymptomCatalog } from "@/db/schema/symptomCatalog";

import type { DatabaseSeederConnection } from "./types";

type SymptomCatalogSeedRow = {
    symptomKey: NonNullable<InsertSymptomCatalog["symptomKey"]>;
    groupKey: NonNullable<InsertSymptomCatalog["groupKey"]>;
    labelKey: NonNullable<InsertSymptomCatalog["labelKey"]>;
    uiPriority: NonNullable<InsertSymptomCatalog["uiPriority"]>;
    isQuickOption: NonNullable<InsertSymptomCatalog["isQuickOption"]>;
    isActive: NonNullable<InsertSymptomCatalog["isActive"]>;
};

const currentTimestampSql = "strftime('%Y-%m-%dT%H:%M:%SZ', 'now')";

export const symptomCatalogSeedRows = [
    {
        symptomKey: "cramps",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.cramps",
        uiPriority: 10,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "pelvic_pain",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.pelvicPain",
        uiPriority: 20,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "lower_back_pain",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.lowerBackPain",
        uiPriority: 30,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "headache",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.headache",
        uiPriority: 40,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "migraine",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.migraine",
        uiPriority: 50,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "bloating",
        groupKey: "digestive",
        labelKey: "checkIn:symptoms.bloating",
        uiPriority: 60,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "nausea",
        groupKey: "digestive",
        labelKey: "checkIn:symptoms.nausea",
        uiPriority: 70,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "diarrhea",
        groupKey: "digestive",
        labelKey: "checkIn:symptoms.diarrhea",
        uiPriority: 80,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "constipation",
        groupKey: "digestive",
        labelKey: "checkIn:symptoms.constipation",
        uiPriority: 90,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "acne",
        groupKey: "skin",
        labelKey: "checkIn:symptoms.acne",
        uiPriority: 100,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "cravings",
        groupKey: "body",
        labelKey: "checkIn:symptoms.cravings",
        uiPriority: 110,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "fatigue",
        groupKey: "energy",
        labelKey: "checkIn:symptoms.fatigue",
        uiPriority: 120,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "insomnia",
        groupKey: "sleep",
        labelKey: "checkIn:symptoms.insomnia",
        uiPriority: 130,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "sleepiness",
        groupKey: "sleep",
        labelKey: "checkIn:symptoms.sleepiness",
        uiPriority: 140,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "breast_tenderness",
        groupKey: "body",
        labelKey: "checkIn:symptoms.breastTenderness",
        uiPriority: 150,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "breast_swelling",
        groupKey: "body",
        labelKey: "checkIn:symptoms.breastSwelling",
        uiPriority: 160,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "mood_swings",
        groupKey: "mood",
        labelKey: "checkIn:symptoms.moodSwings",
        uiPriority: 170,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "irritability",
        groupKey: "mood",
        labelKey: "checkIn:symptoms.irritability",
        uiPriority: 180,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "anxiety",
        groupKey: "mood",
        labelKey: "checkIn:symptoms.anxiety",
        uiPriority: 190,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "sadness",
        groupKey: "mood",
        labelKey: "checkIn:symptoms.sadness",
        uiPriority: 200,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "brain_fog",
        groupKey: "mood",
        labelKey: "checkIn:symptoms.brainFog",
        uiPriority: 210,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "dizziness",
        groupKey: "body",
        labelKey: "checkIn:symptoms.dizziness",
        uiPriority: 220,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "ovulation_pain",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.ovulationPain",
        uiPriority: 230,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "spotting",
        groupKey: "bleeding",
        labelKey: "checkIn:symptoms.spotting",
        uiPriority: 240,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "heavy_bleeding",
        groupKey: "bleeding",
        labelKey: "checkIn:symptoms.heavyBleeding",
        uiPriority: 250,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "clots",
        groupKey: "bleeding",
        labelKey: "checkIn:symptoms.clots",
        uiPriority: 260,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "hot_flashes",
        groupKey: "body",
        labelKey: "checkIn:symptoms.hotFlashes",
        uiPriority: 270,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "chills",
        groupKey: "body",
        labelKey: "checkIn:symptoms.chills",
        uiPriority: 280,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "vulvar_discomfort",
        groupKey: "sexual_health",
        labelKey: "checkIn:symptoms.vulvarDiscomfort",
        uiPriority: 290,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "vaginal_dryness",
        groupKey: "sexual_health",
        labelKey: "checkIn:symptoms.vaginalDryness",
        uiPriority: 300,
        isQuickOption: false,
        isActive: true,
    },
] satisfies readonly SymptomCatalogSeedRow[];

function escapeSqlString(value: string) {
    return `'${value.replaceAll("'", "''")}'`;
}

function renderBoolean(value: boolean) {
    return value ? "1" : "0";
}

function buildUpsertValuesSql(row: SymptomCatalogSeedRow) {
    return `(${escapeSqlString(row.symptomKey)}, ${escapeSqlString(row.groupKey)}, ${escapeSqlString(row.labelKey)}, ${row.uiPriority}, ${renderBoolean(row.isQuickOption)}, ${renderBoolean(row.isActive)}, ${currentTimestampSql}, ${currentTimestampSql})`;
}

function buildSeedSymptomCatalogSql() {
    const valuesSql = symptomCatalogSeedRows.map((row) => buildUpsertValuesSql(row)).join(",\n    ");

    return `
        INSERT INTO symptom_catalog (
            symptom_key,
            group_key,
            label_key,
            ui_priority,
            is_quick_option,
            is_active,
            created_at,
            updated_at
        ) VALUES
            ${valuesSql}
        ON CONFLICT(symptom_key) DO UPDATE SET
            group_key = excluded.group_key,
            label_key = excluded.label_key,
            ui_priority = excluded.ui_priority,
            is_quick_option = excluded.is_quick_option,
            is_active = excluded.is_active,
            updated_at = excluded.updated_at;
    `.trim();
}

function buildDeactivateMissingSymptomsSql() {
    const symptomKeysSql = symptomCatalogSeedRows.map((row) => escapeSqlString(row.symptomKey)).join(", ");

    return `
        UPDATE symptom_catalog
        SET is_active = 0,
            updated_at = ${currentTimestampSql}
        WHERE symptom_key NOT IN (${symptomKeysSql})
          AND is_active != 0;
    `.trim();
}

export async function seedSymptomCatalog(database: DatabaseSeederConnection) {
    await database.execAsync(buildSeedSymptomCatalogSql());
    await database.execAsync(buildDeactivateMissingSymptomsSql());
}
