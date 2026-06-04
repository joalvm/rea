import { SymptomKey } from "@/types/records.types";
import { translate } from "@/modules/localization/i18n";

const SYMPTOM_LABEL_KEYS: Record<SymptomKey, string> = {
    cramps: "checkIn:symptoms.cramps",
    pelvic_pain: "checkIn:symptoms.pelvicPain",
    lower_back_pain: "checkIn:symptoms.lowerBackPain",
    headache: "checkIn:symptoms.headache",
    migraine: "checkIn:symptoms.migraine",
    bloating: "checkIn:symptoms.bloating",
    nausea: "checkIn:symptoms.nausea",
    diarrhea: "checkIn:symptoms.diarrhea",
    constipation: "checkIn:symptoms.constipation",
    acne: "checkIn:symptoms.acne",
    cravings: "checkIn:symptoms.cravings",
    fatigue: "checkIn:symptoms.fatigue",
    insomnia: "checkIn:symptoms.insomnia",
    sleepiness: "checkIn:symptoms.sleepiness",
    breast_tenderness: "checkIn:symptoms.breastTenderness",
    breast_swelling: "checkIn:symptoms.breastSwelling",
    mood_swings: "checkIn:symptoms.moodSwings",
    irritability: "checkIn:symptoms.irritability",
    anxiety: "checkIn:symptoms.anxiety",
    sadness: "checkIn:symptoms.sadness",
    brain_fog: "checkIn:symptoms.brainFog",
    dizziness: "checkIn:symptoms.dizziness",
    ovulation_pain: "checkIn:symptoms.ovulationPain",
    spotting: "checkIn:symptoms.spotting",
    heavy_bleeding: "checkIn:symptoms.heavyBleeding",
    clots: "checkIn:symptoms.clots",
    hot_flashes: "checkIn:symptoms.hotFlashes",
    chills: "checkIn:symptoms.chills",
    vulvar_discomfort: "checkIn:symptoms.vulvarDiscomfort",
    vaginal_dryness: "checkIn:symptoms.vaginalDryness",
};

const LEGACY_SYMPTOM_MAP: Record<string, SymptomKey> = {
    cólicos: "cramps",
    migraña: "migraine",
    acné: "acne",
    hinchazón: "bloating",
    antojos: "cravings",
    insomnio: "insomnia",
    náuseas: "nausea",
    "sensibilidad mamaria": "breast_tenderness",
    "dolor pélvico": "pelvic_pain",
    "dolor lumbar": "lower_back_pain",
    "dolor de cabeza": "headache",
    diarrea: "diarrhea",
    estreñimiento: "constipation",
    cansancio: "fatigue",
    sueño: "sleepiness",
    "cambios de ánimo": "mood_swings",
    irritabilidad: "irritability",
    ansiedad: "anxiety",
    tristeza: "sadness",
    manchado: "spotting",
    coágulos: "clots",
};

/** Opciones visibles y estables del selector de síntomas. */
export const SYMPTOM_OPTIONS = Object.entries(SYMPTOM_LABEL_KEYS).map(([key, labelKey]) => ({
    key: key as SymptomKey,
    label: translate(labelKey),
}));

/** Devuelve etiqueta visible de un síntoma conocido o legado. */
export function labelSymptom(symptom: SymptomKey | string) {
    const normalized = normalizeSymptomKey(symptom);
    if (!normalized) {
        return symptom;
    }

    return translate(SYMPTOM_LABEL_KEYS[normalized]);
}

/** Normaliza claves viejas o modernas a catálogo estable. */
export function normalizeSymptomKey(value: string): SymptomKey | null {
    const raw = value.trim();
    if (!raw) {
        return null;
    }

    if (raw in SYMPTOM_LABEL_KEYS) {
        return raw as SymptomKey;
    }

    const normalized = raw.toLowerCase();
    return LEGACY_SYMPTOM_MAP[normalized] ?? null;
}

/** Convierte listas viejas y nuevas a claves únicas del catálogo. */
export function normalizeSymptomKeys(values: string[]) {
    const normalized = values
        .map((value) => normalizeSymptomKey(value))
        .filter((value): value is SymptomKey => Boolean(value));

    return [...new Set(normalized)];
}
