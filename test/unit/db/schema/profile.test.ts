import { describe, expect, it } from "@jest/globals";

import { profile } from "@/db/schema/profile";
import { checkNames, columnNames, tableName } from "@test/db/utils/schemaMetadata";

describe("Esquema de profile", () => {
    it("define el contrato de la tabla user_profile", () => {
        expect(tableName(profile)).toBe("user_profile");
        expect(columnNames(profile)).toEqual(["id", "name", "birth_year", "created_at", "updated_at", "version"]);
    });

    it("conserva los valores por defecto de profile en el esquema de Drizzle", () => {
        expect(profile.version.default).toBe(1);
    });

    it("declara solo la restricción del año de nacimiento", () => {
        expect(checkNames(profile)).toEqual(["birth_year_check"]);
    });
});
