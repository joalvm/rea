import { openDatabaseSync, type SQLiteOpenOptions } from "expo-sqlite";

export const DATABASE_NAME = "rea.db";
export const DATABASE_VERSION = 1;
export const DATABASE_OPEN_OPTIONS = {
    enableChangeListener: true,
} satisfies SQLiteOpenOptions;

export const conn = openDatabaseSync(DATABASE_NAME, DATABASE_OPEN_OPTIONS);
