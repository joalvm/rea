import db from "../core/database";

/** Borra todos los datos locales persistidos por aplicación. */
export default async function resetAppData() {
    const database = db();
    await database.withTransactionAsync(async () => {
        await database.runAsync("DELETE FROM notification_moments");
        await database.runAsync("DELETE FROM daily_logs");
        await database.runAsync("DELETE FROM mood_checkins");
        await database.runAsync("DELETE FROM cycles");
        await database.runAsync("DELETE FROM app_settings");
    });
}
