import { Goal, Regularity } from "../types";

export const GOALS: Array<{ key: Goal; label: string; description: string; icon: string }> = [
  {
    key: "self_knowledge",
    label: "Entender mi ciclo",
    description: "Fases, registros e insights personales.",
    icon: "heart-pulse"
  },
  {
    key: "track_only",
    label: "Solo registrar",
    description: "Calendario, síntomas y notas privadas.",
    icon: "notebook-heart-outline"
  },
  {
    key: "trying_to_conceive",
    label: "Buscar embarazo",
    description: "Señales fértiles como orientación.",
    icon: "sprout-outline"
  }
];

export const REGULARITY: Array<{ key: Regularity; label: string }> = [
  { key: "regular", label: "Regular" },
  { key: "variable", label: "Variable" },
  { key: "irregular", label: "Irregular" }
];
