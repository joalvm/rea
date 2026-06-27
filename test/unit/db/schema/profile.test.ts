import { describe, expect, it } from "@jest/globals";

import { profile } from "@/db/schema/profile";
import { checkNames, columnNames, tableName } from "@test/db/utils/schemaMetadata";

describe("profile schema", () => {
    it("defines the user_profile table contract", () => {
        expect(tableName(profile)).toBe("user_profile");
        expect(columnNames(profile)).toEqual(["id", "name", "birth_year", "created_at", "updated_at", "version"]);
    });

    it("keeps profile defaults in the Drizzle schema", () => {
        expect(profile.version.default).toBe(1);
    });

    it("declares only the birth year constraint", () => {
        expect(checkNames(profile)).toEqual(["birth_year_check"]);
    });
});
