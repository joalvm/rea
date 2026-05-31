const BACKUP_FILE_PREFIX = "rea-backup";
const BACKUP_FILE_EXTENSION = ".rea";

export const BACKUP_SHARE_MIME_TYPE = "application/vnd.rea.backup";
export const BACKUP_IMPORT_FILE_HINT = ".rea";

/** Construye nombre estable para respaldos exportados por Rea. */
export function buildBackupFileName(stamp: string) {
    return `${BACKUP_FILE_PREFIX}-${stamp}${BACKUP_FILE_EXTENSION}`;
}

/** Distingue rutas que parecen respaldos de Rea o respaldos legados compatibles. */
export function isLikelyBackupUri(uri: string) {
    const normalizedUri = stripQueryAndFragment(uri).toLowerCase();

    return (
        normalizedUri.endsWith(BACKUP_FILE_EXTENSION) ||
        normalizedUri.endsWith(".rea.sqlite3") ||
        normalizedUri.endsWith(".sqlite3") ||
        normalizedUri.endsWith(".sqlite")
    );
}

function stripQueryAndFragment(uri: string) {
    const [path] = uri.split(/[?#]/);
    return path ?? uri;
}
