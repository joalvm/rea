/** Día abreviado usado para edición de repetición semanal. */
export interface ScheduleDayOption {
    key: number;
    label: string;
}

/** Aviso efímero mostrado tras guardar un respaldo local desde ajustes. */
export interface ExportSavedNotice {
    fileName: string;
    fileUri: string;
    message: string;
    canShare: boolean;
}
