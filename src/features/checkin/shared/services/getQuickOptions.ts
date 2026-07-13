import { and, eq, inArray } from "drizzle-orm";

import type { ReproductiveMode, ReproductiveModeFilter } from "@/db/enums/reproductiveMode";
import type { Database } from "@/db/client";
import { symptomCatalog } from "@/db/schema/symptomCatalog";
import type { SymptomCatalog } from "@/db/schema/symptomCatalog";

export type GetQuickOptionsParams = {
    /** Modo reproductivo activo del perfil. Si es `undefined`, solo trae los "all". */
    mode?: ReproductiveMode;
};

/**
 * Carga los síntomas marcados como opción rápida (`is_quick_option = true` y
 * `is_active = true`) del catálogo, filtrados por el modo reproductivo activo.
 *
 * El filtro de modo replica el de `SymptomsScreen`: un síntoma aplica si su
 * `applicable_mode` es `"all"` o coincide con el modo activo. Sin modo conocido,
 * solo se exponen los `"all"`.
 *
 * El resultado va ordenado por `ui_priority` (ascendente), igual que la pantalla
 * de síntomas, para que el intro muestre primero los más relevantes.
 */
export async function getQuickOptions(
    database: Database,
    params: GetQuickOptionsParams = {},
): Promise<SymptomCatalog[]> {
    const { mode } = params;
    const applicableModes: ReproductiveModeFilter[] = mode ? [mode, "all"] : ["all"];

    const rows = await database
        .select()
        .from(symptomCatalog)
        .where(
            and(
                eq(symptomCatalog.isQuickOption, true),
                eq(symptomCatalog.isActive, true),
                inArray(symptomCatalog.applicableMode, applicableModes),
            ),
        )
        .orderBy(symptomCatalog.uiPriority, symptomCatalog.symptomKey);

    return rows;
}
