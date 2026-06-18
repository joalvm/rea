import {
    BabyIcon,
    DropletIcon,
    Flower2Icon,
    type LucideIcon,
    MoonIcon,
    SparkleIcon,
    SparklesIcon,
    SproutIcon,
} from "lucide-react-native";

import type { PhaseKey } from "@/theme/types/PhaseColors";

/**
 * Copia e icono de cada fase para el Home. Es PRESENTACIÓN del feature, no del
 * tema: el tema solo aporta color. Migrar a i18n cuando exista esa capa.
 */
type PhasePresentation = {
    label: string;
    caption: string;
    Icon: LucideIcon;
};

export const PHASE_PRESENTATION: Record<PhaseKey, PhasePresentation> = {
    unknown: {
        label: "Fase por estimar",
        caption: "Registra unos días para afinar tu predicción",
        Icon: SparkleIcon,
    },
    menstrual: {
        label: "Menstruación",
        caption: "Días de cuidado y descanso",
        Icon: DropletIcon,
    },
    follicular: {
        label: "Fase folicular",
        caption: "Tu energía va en aumento",
        Icon: SproutIcon,
    },
    fertile_window: {
        label: "Ventana fértil",
        caption: "Mayor probabilidad de embarazo",
        Icon: Flower2Icon,
    },
    estimated_ovulation: {
        label: "Ovulación estimada",
        caption: "Pico de fertilidad del ciclo",
        Icon: SparklesIcon,
    },
    luteal: {
        label: "Fase lútea",
        caption: "El cuerpo se prepara y desacelera",
        Icon: MoonIcon,
    },
    pregnancy: {
        label: "Embarazo",
        caption: "Predicciones de ciclo en pausa",
        Icon: BabyIcon,
    },
};
