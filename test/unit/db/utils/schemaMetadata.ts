import { getTableConfig, type SQLiteTable } from "drizzle-orm/sqlite-core";

export type ForeignKeyExpectation = {
    columns: string[];
    foreignColumns: string[];
    foreignTable: string;
    onDelete?: string;
};

export function tableName(table: SQLiteTable) {
    return getTableConfig(table).name;
}

export function columnNames(table: SQLiteTable) {
    return getTableConfig(table).columns.map((column) => column.name);
}

export function checkNames(table: SQLiteTable) {
    return getTableConfig(table).checks.map((check) => check.name);
}

export function indexNames(table: SQLiteTable) {
    return getTableConfig(table).indexes.map((index) => index.config.name);
}

export function primaryKeyColumns(table: SQLiteTable) {
    return getTableConfig(table).primaryKeys.map((key) => key.columns.map((column) => column.name));
}

export function uniqueConstraints(table: SQLiteTable) {
    return getTableConfig(table).uniqueConstraints.map((uniqueConstraint) => ({
        name: uniqueConstraint.getName(),
        columns: uniqueConstraint.columns.map((column) => column.name),
    }));
}

export function foreignKeys(table: SQLiteTable): ForeignKeyExpectation[] {
    return getTableConfig(table).foreignKeys.map((foreignKey) => {
        const reference = foreignKey.reference();

        return {
            columns: reference.columns.map((column) => column.name),
            foreignColumns: reference.foreignColumns.map((column) => column.name),
            foreignTable: tableName(reference.foreignTable),
            onDelete: foreignKey.onDelete,
        };
    });
}
