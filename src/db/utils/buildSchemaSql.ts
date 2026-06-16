import type { SQL } from "drizzle-orm";
import { SQLiteSyncDialect, getTableConfig } from "drizzle-orm/sqlite-core";

import {
    checkin,
    checkinMedication,
    checkinSymptom,
    contentDeliveryLog,
    contentItem,
    contentRule,
    contentSource,
    dailySummary,
    intercourseLog,
    medicationCatalog,
    periodRun,
    pregnancyEpisode,
    profile,
    reproductiveIntentHistory,
    schemaMigration,
    symptomCatalog,
} from "@/db/schema/schema";

type AnySQLiteTable = Parameters<typeof getTableConfig>[0];

const dialect = new SQLiteSyncDialect();

const orderedTables: AnySQLiteTable[] = [
    schemaMigration,
    profile,
    reproductiveIntentHistory,
    periodRun,
    pregnancyEpisode,
    symptomCatalog,
    medicationCatalog,
    checkin,
    checkinSymptom,
    checkinMedication,
    intercourseLog,
    dailySummary,
    contentSource,
    contentItem,
    contentRule,
    contentDeliveryLog,
];

function quoteIdentifier(identifier: string) {
    return dialect.escapeName(identifier);
}

function stripTableQualifiers(sqlText: string) {
    return orderedTables.reduce((result, table) => {
        const tableName = quoteIdentifier(getTableConfig(table).name);

        return result.replaceAll(`${tableName}.`, "");
    }, sqlText);
}

function renderSqlFragment(fragment: SQL, invokeSource?: "indexes") {
    return stripTableQualifiers(dialect.sqlToQuery(fragment, invokeSource).sql);
}

function isSqliteColumn(value: unknown): value is {
    name: string;
    getSQLType(): string;
    notNull: boolean;
    primary: boolean;
    hasDefault: boolean;
    default: unknown;
    isUnique: boolean;
} {
    return typeof value === "object" && value !== null && "getSQLType" in value && "name" in value;
}

function renderDefaultValue(value: unknown) {
    if (typeof value === "string") {
        return dialect.escapeString(value);
    }

    if (typeof value === "number") {
        return String(value);
    }

    if (typeof value === "boolean") {
        return value ? "1" : "0";
    }

    if (value === null) {
        return "NULL";
    }

    return renderSqlFragment(value as SQL);
}

function renderIndexColumn(value: unknown) {
    if (isSqliteColumn(value)) {
        return quoteIdentifier(value.name);
    }

    return renderSqlFragment(value as SQL, "indexes");
}

function buildCreateTableStatement(table: AnySQLiteTable) {
    const config = getTableConfig(table);
    const tablePrimaryKeyColumns = new Set(
        config.primaryKeys.flatMap((primaryKey) => primaryKey.columns.map((column) => column.name)),
    );

    const columnDefinitions = config.columns.map((column) => {
        const parts = [quoteIdentifier(column.name), column.getSQLType()];

        if (column.notNull) {
            parts.push("NOT NULL");
        }

        if (column.primary && !tablePrimaryKeyColumns.has(column.name)) {
            parts.push("PRIMARY KEY");
        }

        if (column.isUnique) {
            parts.push("UNIQUE");
        }

        if (column.hasDefault && column.default !== undefined) {
            parts.push(`DEFAULT ${renderDefaultValue(column.default)}`);
        }

        return parts.join(" ");
    });

    const constraints = [
        ...config.primaryKeys.map((primaryKey) => {
            const columns = primaryKey.columns.map((column) => quoteIdentifier(column.name)).join(", ");
            const prefix = primaryKey.name ? `CONSTRAINT ${quoteIdentifier(primaryKey.name)} ` : "";

            return `${prefix}PRIMARY KEY (${columns})`;
        }),
        ...config.uniqueConstraints.map((uniqueConstraint) => {
            const columns = uniqueConstraint.columns.map((column) => quoteIdentifier(column.name)).join(", ");
            const constraintName = uniqueConstraint.getName();
            const prefix = constraintName ? `CONSTRAINT ${quoteIdentifier(constraintName)} ` : "";

            return `${prefix}UNIQUE (${columns})`;
        }),
        ...config.foreignKeys.map((foreignKey) => {
            const reference = foreignKey.reference();
            const columns = reference.columns.map((column) => quoteIdentifier(column.name)).join(", ");
            const foreignColumns = reference.foreignColumns.map((column) => quoteIdentifier(column.name)).join(", ");
            const foreignTableName = quoteIdentifier(getTableConfig(reference.foreignTable).name);
            const onUpdate = foreignKey.onUpdate ? ` ON UPDATE ${foreignKey.onUpdate.toUpperCase()}` : "";
            const onDelete = foreignKey.onDelete ? ` ON DELETE ${foreignKey.onDelete.toUpperCase()}` : "";

            return `FOREIGN KEY (${columns}) REFERENCES ${foreignTableName} (${foreignColumns})${onUpdate}${onDelete}`;
        }),
        ...config.checks.map((check) => {
            const checkValue = renderSqlFragment(check.value);

            return `CONSTRAINT ${quoteIdentifier(check.name)} CHECK (${checkValue})`;
        }),
    ];

    const definitions = [...columnDefinitions, ...constraints].join(",\n    ");

    return `CREATE TABLE IF NOT EXISTS ${quoteIdentifier(config.name)} (\n    ${definitions}\n) STRICT;`;
}

function buildCreateIndexStatements(table: AnySQLiteTable) {
    const config = getTableConfig(table);

    return config.indexes.map((index) => {
        const unique = index.config.unique ? "UNIQUE " : "";
        const columns = index.config.columns.map((column) => renderIndexColumn(column)).join(", ");
        const where = index.config.where ? ` WHERE ${renderSqlFragment(index.config.where, "indexes")}` : "";

        return `CREATE ${unique}INDEX IF NOT EXISTS ${quoteIdentifier(index.config.name)} ON ${quoteIdentifier(config.name)} (${columns})${where};`;
    });
}

export function buildCreateSchemaStatements() {
    return orderedTables.flatMap((table) => [buildCreateTableStatement(table), ...buildCreateIndexStatements(table)]);
}

export function buildDropSchemaStatements() {
    return [...orderedTables]
        .reverse()
        .map((table) => `DROP TABLE IF EXISTS ${quoteIdentifier(getTableConfig(table).name)};`);
}
