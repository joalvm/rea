import { SYMPTOM_OPTIONS } from "@/modules/cycle/utils/symptomCatalog";
import { translate } from "@/modules/localization/i18n";
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
    { key: "none", label: translate("checkIn:daily.bleeding.none") },
    { key: "spotting", label: translate("checkIn:daily.bleeding.spotting") },
    { key: "light", label: translate("checkIn:daily.bleeding.light") },
    { key: "medium", label: translate("checkIn:daily.bleeding.medium") },
    { key: "heavy", label: translate("checkIn:daily.bleeding.heavy") },
];

/** Opciones de impacto funcional del dolor. */
export const PAIN_IMPACT_OPTIONS: PainImpactOption[] = [
    { key: "none", label: translate("checkIn:daily.painImpact.none") },
    { key: "noticeable", label: translate("checkIn:daily.painImpact.noticeable") },
    { key: "limits_day", label: translate("checkIn:daily.painImpact.limitsDay") },
    { key: "stops_day", label: translate("checkIn:daily.painImpact.stopsDay") },
];

/** Opciones de alivio percibido tras medicación. */
export const MEDICATION_RELIEF_OPTIONS: MedicationReliefOption[] = [
    { key: "not_applicable", label: translate("checkIn:daily.medicationRelief.notApplicable") },
    { key: "helped", label: translate("checkIn:daily.medicationRelief.helped") },
    { key: "partly_helped", label: translate("checkIn:daily.medicationRelief.partlyHelped") },
    { key: "did_not_help", label: translate("checkIn:daily.medicationRelief.didNotHelp") },
];

/** Opciones de tamaño de coágulo reportado. */
export const CLOT_SIZE_OPTIONS: ClotSizeOption[] = [
    { key: "none", label: translate("checkIn:daily.clot.none") },
    { key: "small", label: translate("checkIn:daily.clot.small") },
    { key: "medium", label: translate("checkIn:daily.clot.medium") },
    { key: "large", label: translate("checkIn:daily.clot.large") },
];

/** Opciones visibles de estado percibido de SPM. */
export const PMS_STATE_OPTIONS: PmsStateOption[] = [
    { key: "none", label: translate("checkIn:daily.pms.none") },
    { key: "starting", label: translate("checkIn:daily.pms.starting") },
    { key: "present", label: translate("checkIn:daily.pms.present") },
];

/** Opciones visibles de libido. */
export const LIBIDO_LEVEL_OPTIONS: LibidoLevelOption[] = [
    { key: "very_low", label: translate("checkIn:daily.libido.veryLow") },
    { key: "low", label: translate("checkIn:daily.libido.low") },
    { key: "steady", label: translate("checkIn:daily.libido.steady") },
    { key: "high", label: translate("checkIn:daily.libido.high") },
];

/** Ubicaciones frecuentes del dolor. */
export const PAIN_LOCATION_OPTIONS: PainLocationOption[] = [
    { key: "lower_abdomen", label: translate("checkIn:daily.painLocation.lowerAbdomen") },
    { key: "lower_back", label: translate("checkIn:daily.painLocation.lowerBack") },
    { key: "pelvis", label: translate("checkIn:daily.painLocation.pelvis") },
    { key: "head", label: translate("checkIn:daily.painLocation.head") },
    { key: "breasts", label: translate("checkIn:daily.painLocation.breasts") },
];
