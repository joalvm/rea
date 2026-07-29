import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

import type { Database } from "@/db/client";
import { notificationCopyResolver, reprogramAll } from "@/modules/notifications";

import { parseBackup, restoreBackup, type ReaBackup } from "./serializeBackup";

/** Selecciona y valida un JSON local sin mutar la base; la UI confirma el reemplazo después. */
export async function pickBackupFile(): Promise<ReaBackup | null> {
    const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: "application/json",
    });
    const asset = result.assets?.at(0);
    if (result.canceled || !asset) return null;

    const content = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
    });
    return parseBackup(JSON.parse(content) as unknown);
}

/** Reemplaza datos y reprograma recordatorios después de la confirmación explícita. */
export async function restorePickedBackup(database: Database, backup: ReaBackup): Promise<void> {
    await restoreBackup(database, backup);
    await reprogramAll(database, { resolveCopy: notificationCopyResolver() }).catch(() => undefined);
}
