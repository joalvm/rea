import { SymptomKey } from "@/types/records.types";
import { translate } from "@/modules/localization/i18n";

const SYMPTOM_LABEL_KEYS: Record<SymptomKey, string> = {
    cramps: "checkIn:symptoms.cramps",
    migraine: "checkIn:symptoms.migraine",
    acne: "checkIn:symptoms.acne",
    bloating: "checkIn:symptoms.bloating",
    cravings: "checkIn:symptoms.cravings",
    insomnia: "checkIn:symptoms.insomnia",
    nausea: "checkIn:symptoms.nausea",
    breast_tenderness: "checkIn:symptoms.breastTenderness",
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
