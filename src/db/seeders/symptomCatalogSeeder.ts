import type { InsertSymptomCatalog } from "@/db/schema/symptomCatalog";

import type { DatabaseSeederConnection } from "./types";

type SymptomCatalogSeedRow = {
    symptomKey: NonNullable<InsertSymptomCatalog["symptomKey"]>;
    groupKey: NonNullable<InsertSymptomCatalog["groupKey"]>;
    labelKey: NonNullable<InsertSymptomCatalog["labelKey"]>;
    applicableMode: NonNullable<InsertSymptomCatalog["applicableMode"]>;
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
        applicableMode: "all",
        uiPriority: 10,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "pelvic_pain",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.pelvicPain",
        applicableMode: "all",
        uiPriority: 20,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "lower_back_pain",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.lowerBackPain",
        applicableMode: "all",
        uiPriority: 30,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "headache",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.headache",
        applicableMode: "all",
        uiPriority: 40,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "migraine",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.migraine",
        applicableMode: "all",
        uiPriority: 50,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "bloating",
        groupKey: "digestive",
        labelKey: "checkIn:symptoms.bloating",
        applicableMode: "all",
        uiPriority: 60,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "nausea",
        groupKey: "digestive",
        labelKey: "checkIn:symptoms.nausea",
        applicableMode: "all",
        uiPriority: 70,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "diarrhea",
        groupKey: "digestive",
        labelKey: "checkIn:symptoms.diarrhea",
        applicableMode: "all",
        uiPriority: 80,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "constipation",
        groupKey: "digestive",
        labelKey: "checkIn:symptoms.constipation",
        applicableMode: "all",
        uiPriority: 90,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "acne",
        groupKey: "skin",
        labelKey: "checkIn:symptoms.acne",
        applicableMode: "all",
        uiPriority: 100,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "cravings",
        groupKey: "body",
        labelKey: "checkIn:symptoms.cravings",
        applicableMode: "all",
        uiPriority: 110,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "fatigue",
        groupKey: "energy",
        labelKey: "checkIn:symptoms.fatigue",
        applicableMode: "all",
        uiPriority: 120,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "insomnia",
        groupKey: "sleep",
        labelKey: "checkIn:symptoms.insomnia",
        applicableMode: "all",
        uiPriority: 130,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "sleepiness",
        groupKey: "sleep",
        labelKey: "checkIn:symptoms.sleepiness",
        applicableMode: "all",
        uiPriority: 140,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "breast_tenderness",
        groupKey: "body",
        labelKey: "checkIn:symptoms.breastTenderness",
        applicableMode: "all",
        uiPriority: 150,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "breast_swelling",
        groupKey: "body",
        labelKey: "checkIn:symptoms.breastSwelling",
        applicableMode: "all",
        uiPriority: 160,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "mood_swings",
        groupKey: "mood",
        labelKey: "checkIn:symptoms.moodSwings",
        applicableMode: "all",
        uiPriority: 170,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "irritability",
        groupKey: "mood",
        labelKey: "checkIn:symptoms.irritability",
        applicableMode: "all",
        uiPriority: 180,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "anxiety",
        groupKey: "mood",
        labelKey: "checkIn:symptoms.anxiety",
        applicableMode: "all",
        uiPriority: 190,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "sadness",
        groupKey: "mood",
        labelKey: "checkIn:symptoms.sadness",
        applicableMode: "all",
        uiPriority: 200,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "brain_fog",
        groupKey: "mood",
        labelKey: "checkIn:symptoms.brainFog",
        applicableMode: "all",
        uiPriority: 210,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "dizziness",
        groupKey: "body",
        labelKey: "checkIn:symptoms.dizziness",
        applicableMode: "all",
        uiPriority: 220,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "ovulation_pain",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.ovulationPain",
        applicableMode: "tracking_avoid_pregnancy",
        uiPriority: 230,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "spotting",
        groupKey: "bleeding",
        labelKey: "checkIn:symptoms.spotting",
        applicableMode: "all",
        uiPriority: 240,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "heavy_bleeding",
        groupKey: "bleeding",
        labelKey: "checkIn:symptoms.heavyBleeding",
        applicableMode: "all",
        uiPriority: 250,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "clots",
        groupKey: "bleeding",
        labelKey: "checkIn:symptoms.clots",
        applicableMode: "all",
        uiPriority: 260,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "hot_flashes",
        groupKey: "body",
        labelKey: "checkIn:symptoms.hotFlashes",
        applicableMode: "all",
        uiPriority: 270,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "chills",
        groupKey: "body",
        labelKey: "checkIn:symptoms.chills",
        applicableMode: "all",
        uiPriority: 280,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "vulvar_discomfort",
        groupKey: "sexual_health",
        labelKey: "checkIn:symptoms.vulvarDiscomfort",
        applicableMode: "all",
        uiPriority: 290,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "vaginal_dryness",
        groupKey: "sexual_health",
        labelKey: "checkIn:symptoms.vaginalDryness",
        applicableMode: "all",
        uiPriority: 300,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "heartburn",
        groupKey: "digestive",
        labelKey: "checkIn:symptoms.heartburn",
        applicableMode: "pregnancy_tracking",
        uiPriority: 310,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "ankle_swelling",
        groupKey: "body",
        labelKey: "checkIn:symptoms.ankleSwelling",
        applicableMode: "pregnancy_tracking",
        uiPriority: 320,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "braxton_hicks",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.braxtonHicks",
        applicableMode: "pregnancy_tracking",
        uiPriority: 330,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "pelvic_pressure",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.pelvicPressure",
        applicableMode: "pregnancy_tracking",
        uiPriority: 340,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "sciatica",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.sciatica",
        applicableMode: "pregnancy_tracking",
        uiPriority: 350,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "round_ligament_pain",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.roundLigamentPain",
        applicableMode: "pregnancy_tracking",
        uiPriority: 360,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "frequent_urination",
        groupKey: "body",
        labelKey: "checkIn:symptoms.frequentUrination",
        applicableMode: "pregnancy_tracking",
        uiPriority: 370,
        isQuickOption: true,
        isActive: true,
    },
    {
        symptomKey: "shortness_of_breath",
        groupKey: "body",
        labelKey: "checkIn:symptoms.shortnessOfBreath",
        applicableMode: "pregnancy_tracking",
        uiPriority: 380,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "leg_cramps",
        groupKey: "pain",
        labelKey: "checkIn:symptoms.legCramps",
        applicableMode: "pregnancy_tracking",
        uiPriority: 390,
        isQuickOption: false,
        isActive: true,
    },
    {
        symptomKey: "sensitive_smell",
        groupKey: "body",
        labelKey: "checkIn:symptoms.sensitiveSmell",
        applicableMode: "pregnancy_tracking",
        uiPriority: 400,
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
    return `(${escapeSqlString(row.symptomKey)}, ${escapeSqlString(row.groupKey)}, ${escapeSqlString(row.labelKey)}, ${escapeSqlString(row.applicableMode)}, ${row.uiPriority}, ${renderBoolean(row.isQuickOption)}, ${renderBoolean(row.isActive)}, ${currentTimestampSql}, ${currentTimestampSql})`;
}

function buildSeedSymptomCatalogSql() {
    const valuesSql = symptomCatalogSeedRows.map((row) => buildUpsertValuesSql(row)).join(",\n    ");

    return `
        INSERT INTO symptom_catalog (
            symptom_key,
            group_key,
            label_key,
            applicable_mode,
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
            applicable_mode = excluded.applicable_mode,
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
