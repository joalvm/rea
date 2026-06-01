import { SYMPTOM_OPTIONS } from "@/modules/cycle/utils/symptomCatalog";
import {
    BleedingOption,
    ClotSizeOption,
    LibidoLevelOption,
    MedicationReliefOption,
    PainImpactOption,
    PainLocationOption,
    PmsStateOption,
    SymptomOption,
} from "../check-in.types";

/** Síntomas rápidos disponibles en registro diario. */
export const SYMPTOMS: SymptomOption[] = SYMPTOM_OPTIONS;

/** Opciones de intensidad de sangrado. */
export const BLEEDING_OPTIONS: BleedingOption[] = [
    { key: "none", label: "Nada" },
    { key: "spotting", label: "Manchado" },
    { key: "light", label: "Leve" },
    { key: "medium", label: "Medio" },
    { key: "heavy", label: "Abundante" },
];

/** Opciones de impacto funcional del dolor. */
export const PAIN_IMPACT_OPTIONS: PainImpactOption[] = [
    { key: "none", label: "No frenó" },
    { key: "noticeable", label: "Se notó" },
    { key: "limits_day", label: "Me limitó" },
    { key: "stops_day", label: "Me tumbó" },
];

/** Opciones de alivio percibido tras medicación. */
export const MEDICATION_RELIEF_OPTIONS: MedicationReliefOption[] = [
    { key: "not_applicable", label: "No tomé" },
    { key: "helped", label: "Sí ayudó" },
    { key: "partly_helped", label: "Ayudó poco" },
    { key: "did_not_help", label: "No ayudó" },
];

/** Opciones de tamaño de coágulo reportado. */
export const CLOT_SIZE_OPTIONS: ClotSizeOption[] = [
    { key: "none", label: "No" },
    { key: "small", label: "Pequeños" },
    { key: "medium", label: "Medios" },
    { key: "large", label: "Grandes" },
];

/** Opciones visibles de estado percibido de SPM. */
export const PMS_STATE_OPTIONS: PmsStateOption[] = [
    { key: "none", label: "No" },
    { key: "starting", label: "Empezando" },
    { key: "present", label: "Sí lo siento" },
];

/** Opciones visibles de libido. */
export const LIBIDO_LEVEL_OPTIONS: LibidoLevelOption[] = [
    { key: "very_low", label: "Muy baja" },
    { key: "low", label: "Baja" },
    { key: "steady", label: "Normal" },
    { key: "high", label: "Alta" },
];

/** Ubicaciones frecuentes del dolor. */
export const PAIN_LOCATION_OPTIONS: PainLocationOption[] = [
    { key: "lower_abdomen", label: "Bajo vientre" },
    { key: "lower_back", label: "Espalda baja" },
    { key: "pelvis", label: "Pelvis" },
    { key: "head", label: "Cabeza" },
    { key: "breasts", label: "Pecho" },
];
