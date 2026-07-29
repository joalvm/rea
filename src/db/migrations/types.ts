export type MigrationConnection = {
    execAsync(source: string): Promise<unknown>;
};

export type DatabaseMigration = {
    from: number;
    to: number;
    name: string;
    up(database: MigrationConnection): Promise<void>;
};
