import type { PropsWithChildren } from "react";
import { SQLiteProvider } from "expo-sqlite";

import { DATABASE_NAME, DATABASE_OPEN_OPTIONS } from "./config";
import { initializeDatabase } from "./initializeDatabase";

export function DatabaseProvider({ children }: PropsWithChildren) {
    return (
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase} options={DATABASE_OPEN_OPTIONS}>
            {children}
        </SQLiteProvider>
    );
}
