import { desc, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { cyclePrediction } from "@/db/schema/cyclePrediction";
import { useDatabase } from "@/db/useDatabase";

/**
 * Predicción vigente de un perfil: `cycle_predictions` es un log (PK
 * `profileId + calculationDate`), no una fila única — "vigente" es la de
 * `calculation_date` más reciente.
 */
export function useCurrentPrediction(profileId: string) {
    const database = useDatabase();
    const { data, error, updatedAt } = useLiveQuery(
        database
            .select()
            .from(cyclePrediction)
            .where(eq(cyclePrediction.profileId, profileId))
            .orderBy(desc(cyclePrediction.calculationDate))
            .limit(1),
        [profileId],
    );

    return { prediction: data?.at(0) ?? null, error, updatedAt };
}
