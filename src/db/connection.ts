import { openDatabaseSync } from "expo-sqlite";

import { DATABASE_NAME, DATABASE_OPEN_OPTIONS } from "./config";

export const conn = openDatabaseSync(DATABASE_NAME, DATABASE_OPEN_OPTIONS);
