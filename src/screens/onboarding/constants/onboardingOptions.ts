import { Goal, Regularity } from "@/types/settings.types";

export const GOALS: { key: Goal; label: string; description: string; icon: string }[] = [
    {
        key: "self_knowledge",
        label: "Entender mi ciclo",
        description: "Fases, registros y señales personales.",
        icon: "heart-pulse",
    },
    {
        key: "track_only",
        label: "Solo registrar",
        description: "Calendario, síntomas y notas privadas.",
        icon: "notebook-heart-outline",
    },
    {
        key: "trying_to_conceive",
        label: "Buscar embarazo",
        description: "Señales fértiles como orientación.",
        icon: "sprout-outline",
    },
];

export const REGULARITY: { key: Regularity; label: string }[] = [
    { key: "regular", label: "Regular" },
    { key: "variable", label: "Variable" },
    { key: "irregular", label: "Irregular" },
];
