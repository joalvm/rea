import { ContentSourceType } from "@/modules/storage/schemas/entities";

export interface ContentSourceSeed {
    id: string;
    label_key: string;
    reference_key: string | null;
    source_url: string;
    source_type: ContentSourceType;
    reviewed_at: string;
}

/** Fuentes locales auditables usadas por contenido editorial incluido en la app. */
const contentSourceCatalog: ContentSourceSeed[] = [
    {
        id: "owh_menstrual_cycle",
        label_key: "contentSources:sources.owhMenstrualCycle.label",
        reference_key: "contentSources:sources.owhMenstrualCycle.reference",
        source_url: "https://womenshealth.gov/menstrual-cycle",
        source_type: "government_health",
        reviewed_at: "2026-06-04",
    },
    {
        id: "medline_period_pain",
        label_key: "contentSources:sources.medlinePeriodPain.label",
        reference_key: "contentSources:sources.medlinePeriodPain.reference",
        source_url: "https://medlineplus.gov/periodpain.html",
        source_type: "government_health",
        reviewed_at: "2026-06-04",
    },
    {
        id: "acog_dysmenorrhea",
        label_key: "contentSources:sources.acogDysmenorrhea.label",
        reference_key: "contentSources:sources.acogDysmenorrhea.reference",
        source_url: "https://www.acog.org/womens-health/faqs/dysmenorrhea-painful-periods",
        source_type: "clinical_education",
        reviewed_at: "2026-06-04",
    },
    {
        id: "acog_pms",
        label_key: "contentSources:sources.acogPms.label",
        reference_key: "contentSources:sources.acogPms.reference",
        source_url: "https://www.acog.org/womens-health/faqs/premenstrual-syndrome",
        source_type: "clinical_education",
        reviewed_at: "2026-06-04",
    },
];

export default contentSourceCatalog;
