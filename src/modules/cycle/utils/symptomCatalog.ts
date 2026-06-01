import { SymptomKey } from "@/types/records.types";

const SYMPTOM_LABELS: Record<SymptomKey, string> = {
    cramps: "Cólicos",
    migraine: "Migraña",
    acne: "Acné",
    bloating: "Hinchazón",
    cravings: "Antojos",
    insomnia: "Insomnio",
    nausea: "Náuseas",
    breast_tenderness: "Sensibilidad mamaria",
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
export const SYMPTOM_OPTIONS = Object.entries(SYMPTOM_LABELS).map(([key, label]) => ({
    key: key as SymptomKey,
    label,
}));

/** Devuelve etiqueta visible de un síntoma conocido o legado. */
export function labelSymptom(symptom: SymptomKey | string) {
    const normalized = normalizeSymptomKey(symptom);
    if (!normalized) {
        return symptom;
    }

    return SYMPTOM_LABELS[normalized];
}

/** Normaliza claves viejas o modernas a catálogo estable. */
export function normalizeSymptomKey(value: string): SymptomKey | null {
    const raw = value.trim();
    if (!raw) {
        return null;
    }

    if (raw in SYMPTOM_LABELS) {
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
