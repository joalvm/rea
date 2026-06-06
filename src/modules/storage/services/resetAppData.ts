import { recreateDatabase } from "../connection";

/** Borra archivo SQLite local y lo recrea con contrato vigente, sin conservar esquema anterior. */
export default async function resetAppData() {
    await recreateDatabase();
}
