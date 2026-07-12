import type { SQLiteOpenOptions } from "expo-sqlite";

export const DATABASE_NAME = "rea.db";
export const DATABASE_VERSION = 5;
export const DATABASE_OPEN_OPTIONS = {
    enableChangeListener: true,
} satisfies SQLiteOpenOptions;
