import type { SQLiteOpenOptions } from "expo-sqlite";

export const DATABASE_NAME = "rea.db";
export const DATABASE_VERSION = 2;
export const DATABASE_OPEN_OPTIONS = {
    enableChangeListener: true,
} satisfies SQLiteOpenOptions;
