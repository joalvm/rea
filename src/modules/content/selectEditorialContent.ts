import getDatabase from "@/modules/storage/connection";
import { ContentItemEntity, ContentRuleEntity, PhaseConfidence } from "@/modules/storage/schemas/entities";
import { EditorialContentCard, EditorialContentContext } from "@/types/content.types";

interface ContentCandidateRow extends ContentItemEntity {
    source_label_key: string | null;
    source_reference_key: string | null;
    source_url: string | null;
}

interface ContentCandidate {
    item: ContentCandidateRow;
    rules: ContentRuleEntity[];
}

const confidenceRank: Record<PhaseConfidence, number> = {
    low: 1,
    medium: 2,
    high: 3,
};

/** Selecciona contenido editorial local desde reglas versionadas, sin API ni copy remoto. */
export default async function selectEditorialContent(context: EditorialContentContext) {
    const database = await getDatabase();
    const [items, rules] = await Promise.all([
        database.getAllAsync<ContentCandidateRow>(
            `SELECT
                content_items.*,
                content_sources.label_key AS source_label_key,
                content_sources.reference_key AS source_reference_key,
                content_sources.source_url AS source_url
             FROM content_items
             LEFT JOIN content_sources ON content_sources.id = content_items.source_id
             WHERE content_items.is_active = 1
               AND content_items.locale = ?
               AND (content_items.valid_from IS NULL OR content_items.valid_from <= date('now'))
               AND (content_items.valid_until IS NULL OR content_items.valid_until >= date('now'))
             ORDER BY content_items.priority ASC, content_items.id ASC`,
            context.locale,
        ),
        database.getAllAsync<ContentRuleEntity>(
            `SELECT content_rules.*
             FROM content_rules
             INNER JOIN content_items ON content_items.id = content_rules.content_item_id
             WHERE content_items.is_active = 1
               AND content_items.locale = ?
             ORDER BY content_rules.priority ASC, content_rules.id ASC`,
            context.locale,
        ),
    ]);

    const rulesByContent = groupRulesByContent(rules);

    return items
        .map((item): ContentCandidate => ({ item, rules: rulesByContent.get(item.id) ?? [] }))
        .filter((candidate) => isCandidateAllowed(candidate, context))
        .sort((left, right) => left.item.priority - right.item.priority || left.item.id.localeCompare(right.item.id))
        .slice(0, context.limit)
        .map(mapCandidateToCard);
}

function groupRulesByContent(rules: ContentRuleEntity[]) {
    return rules.reduce<Map<string, ContentRuleEntity[]>>((accumulator, rule) => {
        const current = accumulator.get(rule.content_item_id) ?? [];
        current.push(rule);
        accumulator.set(rule.content_item_id, current);

        return accumulator;
    }, new Map());
}

function isCandidateAllowed(candidate: ContentCandidate, context: EditorialContentContext) {
    if (!matchesConfidence(candidate.item.min_confidence, context.phaseConfidence)) {
        return false;
    }

    if (candidate.rules.length === 0) {
        return false;
    }

    return candidate.rules.some((rule) => matchesRule(rule, context));
}

function matchesConfidence(required: PhaseConfidence | null, current: PhaseConfidence | undefined) {
    if (!required) {
        return true;
    }

    if (!current) {
        return false;
    }

    return confidenceRank[current] >= confidenceRank[required];
}

function matchesRule(rule: ContentRuleEntity, context: EditorialContentContext) {
    if (rule.trigger_type === "general") {
        return true;
    }

    if (rule.trigger_type === "phase") {
        return Boolean(rule.trigger_key && rule.trigger_key === context.phase);
    }

    if (rule.trigger_type === "symptom") {
        return Boolean(rule.trigger_key && context.symptomKeys.includes(rule.trigger_key));
    }

    if (rule.trigger_type === "metric_threshold") {
        return matchesMetric(rule, context.metrics[rule.trigger_key ?? ""]);
    }

    if (rule.trigger_type === "reproductive_intent") {
        return String(context.tryingToConceive ? 1 : 0) === rule.required_value;
    }

    if (rule.trigger_type === "contraception") {
        return String(context.hormonalContraception ? 1 : 0) === rule.required_value;
    }

    return false;
}

function matchesMetric(rule: ContentRuleEntity, value: number | null | undefined) {
    if (typeof value !== "number") {
        return false;
    }

    if (typeof rule.min_value === "number" && value < rule.min_value) {
        return false;
    }

    if (typeof rule.max_value === "number" && value > rule.max_value) {
        return false;
    }

    return true;
}

function mapCandidateToCard({ item }: ContentCandidate): EditorialContentCard {
    return {
        id: item.id,
        bodyKey: item.body_key,
        contentType: item.content_type,
        sourceLabelKey: item.source_label_key,
        sourceReferenceKey: item.source_reference_key,
        sourceUrl: item.source_url,
        titleKey: item.title_key,
        topic: item.topic,
    };
}
