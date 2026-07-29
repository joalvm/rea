import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import type { Database } from "@/db/client";
import { appSettings } from "@/db/schema/appSettings";
import { eq } from "drizzle-orm";

import { serializeBackup } from "./serializeBackup";

/** Escribe y comparte un backup JSON local; no usa red ni proveedor externo. */
export async function exportBackupFile(
    database: Database,
    profileId: string | undefined,
    dialogTitle: string,
): Promise<string> {
    const backup = await serializeBackup(database);
    if (!FileSystem.documentDirectory) {
        throw new Error("El almacenamiento local no está disponible.");
    }
    const uri = `${FileSystem.documentDirectory}rea-backup-${backup.exportedAt.replaceAll(/[:.]/g, "-")}.json`;
    await FileSystem.writeAsStringAsync(uri, JSON.stringify(backup, null, 2), {
        encoding: FileSystem.EncodingType.UTF8,
    });
    if (profileId) {
        await database
            .update(appSettings)
            .set({ lastBackupAt: backup.exportedAt })
            .where(eq(appSettings.userId, profileId));
    }
    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/json", dialogTitle });
    }
    return uri;
}
