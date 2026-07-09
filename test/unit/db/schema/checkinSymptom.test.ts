import { describe, expect, it } from "@jest/globals";

import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { checkNames, columnNames, foreignKeys, indexNames, primaryKeyColumns } from "@test/db/utils/schemaMetadata";

describe("Esquema de checkinSymptom", () => {
    it("define las columnas de la tabla", () => {
        expect(columnNames(checkinSymptom)).toEqual([
            "checkin_id",
            "symptom_key",
            "intensity",
            "created_at",
            "updated_at",
            "deleted_at",
            "version",
        ]);
    });

    it("declara clave compuesta, restricciones CHECK, índices y claves foráneas", () => {
        expect(primaryKeyColumns(checkinSymptom)).toEqual([["checkin_id", "symptom_key"]]);
        expect(indexNames(checkinSymptom)).toEqual(["ix_checkin_symptoms_lookup"]);
        expect(checkNames(checkinSymptom)).toEqual(["checkin_symptom_intensity_check"]);
        expect(foreignKeys(checkinSymptom)).toEqual([
            { columns: ["checkin_id"], foreignColumns: ["id"], foreignTable: "checkins", onDelete: "cascade" },
            {
                columns: ["symptom_key"],
                foreignColumns: ["symptom_key"],
                foreignTable: "symptom_catalog",
                onDelete: undefined,
            },
        ]);
    });
});
