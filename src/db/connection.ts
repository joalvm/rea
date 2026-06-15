import { openDatabaseSync } from "expo-sqlite";

export const DATABASE_NAME = "rea.db";

function openConnection() {
    try {
        const connection = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });
        console.log(`Database connection to ${DATABASE_NAME} established successfully.`);
        return connection;
    } catch (error) {
        console.error(`Failed to connect to database ${DATABASE_NAME}:`, error);
        throw error;
    }
}

export const conn = openConnection();
