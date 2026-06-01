import { Regularity } from "@/types/settings.types";

export const TRYING_TO_CONCEIVE_OPTION = {
    label: "También buscar embarazo",
    description: "Activa referencias probables de fertilidad junto con tus registros, sin promesas clínicas.",
    icon: "sprout-outline",
};

export const REGULARITY: { key: Regularity; label: string }[] = [
    { key: "regular", label: "Sí, casi siempre" },
    { key: "variable", label: "A veces cambia" },
    { key: "irregular", label: "No, cambia bastante" },
];
