import type { DatabaseSeeder, DatabaseSeederConnection } from "./types";

import { seedSymptomCatalog } from "./symptomCatalogSeeder";

const databaseSeeders: readonly DatabaseSeeder[] = [seedSymptomCatalog];

export async function runDatabaseSeeders(database: DatabaseSeederConnection) {
    for (const seeder of databaseSeeders) {
        await seeder(database);
    }
}
