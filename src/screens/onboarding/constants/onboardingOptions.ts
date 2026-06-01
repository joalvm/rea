import { Goal, Regularity } from "@/types/settings.types";

export const GOALS: { key: Goal; label: string; description: string; icon: string }[] = [
    {
        key: "self_knowledge",
        label: "Entender mi ciclo",
        description: "Ver mis patrones, síntomas y cambios del mes con más claridad.",
        icon: "heart-pulse",
    },
    {
        key: "trying_to_conceive",
        label: "También buscar embarazo",
        description: "Tener a mano referencias de fertilidad junto con mis registros.",
        icon: "sprout-outline",
    },
];

export const REGULARITY: { key: Regularity; label: string }[] = [
    { key: "regular", label: "Sí, casi siempre" },
    { key: "variable", label: "A veces cambia" },
    { key: "irregular", label: "No, cambia bastante" },
];
