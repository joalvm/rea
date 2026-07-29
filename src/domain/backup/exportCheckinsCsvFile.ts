import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import type { Database } from "@/db/client";

import { serializeCheckinsCsv } from "./serializeCheckinsCsv";
import { serializeBackup } from "./serializeBackup";

/** Escribe y comparte el CSV legible; no lo marca como backup restaurable. */
export async function exportCheckinsCsvFile(database: Database, dialogTitle: string): Promise<string> {
    const backup = await serializeBackup(database);
    if (!FileSystem.documentDirectory) {
        throw new Error("El almacenamiento local no está disponible.");
    }

    const uri = `${FileSystem.documentDirectory}rea-checkins-${backup.exportedAt.replaceAll(/[:.]/g, "-")}.csv`;
    await FileSystem.writeAsStringAsync(uri, serializeCheckinsCsv(backup), {
        encoding: FileSystem.EncodingType.UTF8,
    });
    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle, UTI: "public.comma-separated-values-text" });
    }
    return uri;
}
