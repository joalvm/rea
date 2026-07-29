import { asc } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { contentSource } from "@/db/schema/contentSource";
import { useDatabase } from "@/db/useDatabase";

/** Fuentes editoriales locales para el panel de confianza de Ajustes. */
export function useContentSources() {
    const database = useDatabase();
    const { data, error, updatedAt } = useLiveQuery(
        database.select().from(contentSource).orderBy(asc(contentSource.reviewedAt)),
        [],
    );

    return { sources: data ?? [], error, updatedAt };
}
