import { migrateV6ToV7 } from "./v6-to-v7";

export const databaseMigrations = [migrateV6ToV7] as const;
