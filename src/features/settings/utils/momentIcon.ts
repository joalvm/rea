import { MomentType } from "@/types/records.types";

/** Devuelve icono visual según tipo de momento. */
export default function momentIcon(type: MomentType) {
    if (type === "morning") {
        return "weather-sunset-up";
    }

    if (type === "night") {
        return "weather-night";
    }

    return "heart-pulse";
}
