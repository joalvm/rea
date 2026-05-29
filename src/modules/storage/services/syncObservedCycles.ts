import db from "../core/database";
import { loadAllDailyLogs } from "../repositories/dailyLogs.repository";
import { buildObservedPeriodRuns } from "../utils/periodRuns.utils";

/** Regenera ciclos observados desde logs diarios para mantener consistencia. */
export default async function syncObservedCyclesFromDailyLogs() {
    const database = db();
    const dailyLogs = await loadAllDailyLogs();
    const runs = buildObservedPeriodRuns(dailyLogs);

    await database.withTransactionAsync(async () => {
        await database.runAsync("DELETE FROM cycles WHERE source = 'observed' OR predicted = 0");

        for (const run of runs) {
            await database.runAsync(
                "INSERT INTO cycles (startDate, endDate, predicted, source, createdAt) VALUES (?, ?, ?, ?, ?)",
                run.start,
                run.end,
                0,
                "observed",
                `${run.start}T12:00:00.000Z`,
            );
        }
    });
}
