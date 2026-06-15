import { afterEach, beforeEach } from "@jest/globals";

import { createRealDatabase, type RealDatabase } from "@test/utils/createRealDatabase";

export function createDatabaseTestContext() {
    let database: RealDatabase | null = null;

    beforeEach(async () => {
        database = await createRealDatabase();
    });

    afterEach(() => {
        database?.close();
        database = null;
    });

    return {
        get database() {
            if (database == null) {
                throw new Error("Real database test context was accessed before initialization");
            }

            return database;
        },
    };
}
