import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { profile } from "@/db/schema/profile";
import { useDatabase } from "@/db/useDatabase";

/** El único perfil local (app sin cuentas ni sync): la fila más antigua. */
export function useLocalProfile() {
    const database = useDatabase();
    const { data, error, updatedAt } = useLiveQuery(
        database.select().from(profile).orderBy(profile.createdAt).limit(1),
        [],
    );

    return { profile: data?.at(0) ?? null, error, updatedAt };
}
