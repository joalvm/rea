import { and, asc, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { contentItem } from "@/db/schema/contentItem";
import { contentRule } from "@/db/schema/contentRule";
import { useDatabase } from "@/db/useDatabase";

/** Lee el catálogo editorial y sus reglas para que cada superficie aplique su propio contexto. */
export function useContentCatalog(locale: string) {
    const database = useDatabase();
    const itemsQuery = useLiveQuery(
        database
            .select()
            .from(contentItem)
            .where(and(eq(contentItem.locale, locale), eq(contentItem.isActive, true)))
            .orderBy(asc(contentItem.priority)),
        [locale],
    );
    const rulesQuery = useLiveQuery(database.select().from(contentRule), []);

    return {
        items: itemsQuery.data ?? [],
        rules: rulesQuery.data ?? [],
        error: itemsQuery.error ?? rulesQuery.error,
        updatedAt: itemsQuery.updatedAt ?? rulesQuery.updatedAt,
    };
}
