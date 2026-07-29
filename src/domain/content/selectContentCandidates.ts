import type { ContentItem } from "@/db/schema/contentItem";
import type { ContentRule } from "@/db/schema/contentRule";
import type { ReproductiveMode } from "@/db/enums/reproductiveMode";

export type ContentContext = {
    metrics?: Record<string, number | null | undefined>;
    phase?: string | null;
    pregnancyWeek?: number | null;
    reproductiveMode?: ReproductiveMode | null;
};

/** Evalúa reglas declarativas con AND: un contenido entra solo si todas sus reglas coinciden. */
export function selectContentCandidates(
    items: ContentItem[],
    rules: ContentRule[],
    context: ContentContext,
): ContentItem[] {
    const rulesByItem = new Map<string, ContentRule[]>();
    for (const rule of rules) {
        const current = rulesByItem.get(rule.contentItemId) ?? [];
        current.push(rule);
        rulesByItem.set(rule.contentItemId, current);
    }

    return items
        .filter((item) => item.isActive && matchesMode(item.targetMode, context.reproductiveMode))
        .filter((item) => (rulesByItem.get(item.id) ?? []).every((rule) => matchesRule(rule, context)))
        .sort((left, right) => left.priority - right.priority);
}

function matchesMode(targetMode: ContentItem["targetMode"], mode: ReproductiveMode | null | undefined) {
    return targetMode === "all" || mode === null || mode === undefined || targetMode === mode;
}

function matchesRule(rule: ContentRule, context: ContentContext) {
    if (rule.triggerType === "general") return true;
    if (rule.triggerType === "pregnancy_week") {
        return (
            context.pregnancyWeek !== null &&
            context.pregnancyWeek !== undefined &&
            (rule.minValue === null || context.pregnancyWeek >= rule.minValue) &&
            (rule.maxValue === null || context.pregnancyWeek <= rule.maxValue)
        );
    }
    if (rule.triggerType === "phase") return context.phase === rule.requiredValue;
    if (rule.triggerType === "reproductive_intent") return context.reproductiveMode === rule.requiredValue;
    if (rule.triggerType === "metric_threshold") {
        const value = rule.triggerKey ? context.metrics?.[rule.triggerKey] : undefined;
        return (
            value !== null &&
            value !== undefined &&
            (rule.minValue === null || value >= rule.minValue) &&
            (rule.maxValue === null || value <= rule.maxValue)
        );
    }
    return true;
}
