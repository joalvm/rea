import { and, asc, eq, isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { medicationCatalog } from "@/db/schema/medicationCatalog";
import { useLocalProfile } from "./useLocalProfile";
import { useDatabase } from "@/db/useDatabase";

/** Catálogo personal activo del perfil local, sin mezclar filas archivadas. */
export function useMedicationCatalog() {
    const database = useDatabase();
    const { profile } = useLocalProfile();
    const { data, error, updatedAt } = useLiveQuery(
        database
            .select()
            .from(medicationCatalog)
            .where(and(eq(medicationCatalog.profileId, profile?.id ?? ""), isNull(medicationCatalog.deletedAt)))
            .orderBy(asc(medicationCatalog.name)),
        [profile?.id ?? ""],
    );

    return { medications: data ?? [], error, updatedAt };
}
