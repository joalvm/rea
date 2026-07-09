export type DatabaseSeederConnection = {
    execAsync(source: string): Promise<unknown>;
};

export type DatabaseSeeder = (database: DatabaseSeederConnection) => Promise<void>;
