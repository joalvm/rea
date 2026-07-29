import { and, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { contentItem } from "@/db/schema/contentItem";
import { contentSource } from "@/db/schema/contentSource";
import { useDatabase } from "@/db/useDatabase";

/** Lee una pieza editorial junto a su fuente para la pantalla de detalle. */
export function useContentItem(id: string) {
    const database = useDatabase();
    const { data, error, updatedAt } = useLiveQuery(
        database
            .select({ item: contentItem, source: contentSource })
            .from(contentItem)
            .leftJoin(contentSource, eq(contentItem.sourceId, contentSource.id))
            .where(and(eq(contentItem.id, id), eq(contentItem.isActive, true)))
            .limit(1),
        [id],
    );

    return { content: data?.at(0) ?? null, error, updatedAt };
}
