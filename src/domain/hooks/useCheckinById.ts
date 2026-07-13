import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { checkin } from "@/db/schema/checkin";
import { useDatabase } from "@/db/useDatabase";

/**
 * Una fila de `checkins` por id, para que la ruta `checkin/edit/[id]` reaccione
 * si el registro desaparece (p. ej. borrado desde otra pantalla). La hidratación
 * del draft del wizard la hace la ruta con `getCheckinById` (que trae síntomas y
 * medicamentos); este hook solo vigila la fila cabeza.
 */
export function useCheckinById(checkinId: string) {
    const database = useDatabase();
    const { data, error, updatedAt } = useLiveQuery(
        database.select().from(checkin).where(eq(checkin.id, checkinId)).limit(1),
        [checkinId],
    );

    return { checkin: data?.at(0) ?? null, error, updatedAt };
}
