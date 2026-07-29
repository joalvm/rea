import type { Database } from "@/db/client";
import { resetDatabase } from "@/db/initializeDatabase";
import { rotateDatabaseKey } from "@/domain/privacy/deviceKey";
import { notificationCopyResolver, reprogramAll } from "@/modules/notifications";

/** Borra la instalación, rota la clave y cancela recordatorios ya programados. */
export async function deleteAllLocalData(database: Database): Promise<void> {
    await resetDatabase(database.$client);
    await rotateDatabaseKey(database.$client);
    await reprogramAll(database, { resolveCopy: notificationCopyResolver() }).catch(() => undefined);
}
