import { ContentTriggerType } from "@/modules/storage/schemas/entities";

export interface ContentRuleSeed {
    id: string;
    content_item_id: string;
    trigger_type: ContentTriggerType;
    trigger_key: string | null;
    min_value: number | null;
    max_value: number | null;
    required_value: string | null;
    priority: number;
}

/** Reglas estructuradas para seleccionar contenido sin expresiones ejecutables ni API. */
const contentRuleCatalog: ContentRuleSeed[] = [
    {
        id: "cycle_basics_general",
        content_item_id: "cycle_basics",
        trigger_type: "general",
        trigger_key: null,
        min_value: null,
        max_value: null,
        required_value: null,
        priority: 10,
    },
    {
        id: "period_pain_care_pain_metric",
        content_item_id: "period_pain_care",
        trigger_type: "metric_threshold",
        trigger_key: "pain_intensity",
        min_value: 3,
        max_value: null,
        required_value: null,
        priority: 20,
    },
    {
        id: "heavy_bleeding_observation_symptom",
        content_item_id: "heavy_bleeding_observation",
        trigger_type: "symptom",
        trigger_key: "heavy_bleeding",
        min_value: null,
        max_value: null,
        required_value: null,
        priority: 30,
    },
    {
        id: "pms_observation_luteal_phase",
        content_item_id: "pms_observation",
        trigger_type: "phase",
        trigger_key: "luteal",
        min_value: null,
        max_value: null,
        required_value: null,
        priority: 40,
    },
    {
        id: "spotting_context_symptom",
        content_item_id: "spotting_context",
        trigger_type: "symptom",
        trigger_key: "spotting",
        min_value: null,
        max_value: null,
        required_value: null,
        priority: 50,
    },
];

export default contentRuleCatalog;
