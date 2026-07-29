import type { DatabaseSeeder, DatabaseSeederConnection } from "./types";

import { seedSymptomCatalog } from "./symptomCatalogSeeder";
import { seedContentCatalog } from "./contentSeeder";

const databaseSeeders: readonly DatabaseSeeder[] = [seedSymptomCatalog, seedContentCatalog];

export async function runDatabaseSeeders(database: DatabaseSeederConnection) {
    for (const seeder of databaseSeeders) {
        await seeder(database);
    }
}
