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
 * Icono de cada fase para el Home. Es PRESENTACIÓN del feature (el tema solo aporta
 * color). La copia de cada fase vive en el namespace `home`.
 */
export const PHASE_ICONS: Record<PhaseKey, LucideIcon> = {
    unknown: SparkleIcon,
    menstrual: DropletIcon,
    follicular: SproutIcon,
    fertile_window: Flower2Icon,
    estimated_ovulation: SparklesIcon,
    luteal: MoonIcon,
    pregnancy: BabyIcon,
};
