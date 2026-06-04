import { AppData } from "@/types/app.types";

import getDatabase from "../connection";
import {
    CheckInEntity,
    CheckInSymptomEntity,
    PeriodRunEntity,
    ReproductiveIntentEntity,
    UserProfileEntity,
} from "../schemas/entities";
import {
    buildDailyLogs,
    buildNotificationCadence,
    buildSettings,
    mapCheckInToMoment,
    mapPeriodRunToCycle,
} from "./loadAppDataMappers";

/** Carga modelos de vista desde el esquema normalizado vigente. */
export default async function loadAppData(): Promise<AppData> {
    const database = await getDatabase();
    const [profile, activeIntent, periodRuns, checkInRows] = await Promise.all([
        database.getFirstAsync<UserProfileEntity>("SELECT * FROM user_profile ORDER BY created_at ASC LIMIT 1"),
        database.getFirstAsync<ReproductiveIntentEntity>(
            `SELECT *
             FROM reproductive_intent_history
             WHERE deleted_at IS NULL
             ORDER BY effective_from DESC
             LIMIT 1`,
        ),
        database.getAllAsync<PeriodRunEntity>(
            `SELECT *
             FROM period_runs
             WHERE deleted_at IS NULL
             ORDER BY start_date DESC`,
        ),
        loadCheckIns(database),
    ]);
    const settings = buildSettings(profile, activeIntent, periodRuns);

    return {
        settings,
        cycles: periodRuns.map(mapPeriodRunToCycle),
        moodCheckIns: checkInRows.checkins.map(mapCheckInToMoment),
        dailyLogs: buildDailyLogs(checkInRows),
        notificationCadence: profile ? buildNotificationCadence(profile) : null,
    };
}

async function loadCheckIns(database: Awaited<ReturnType<typeof getDatabase>>) {
    const checkins = await database.getAllAsync<CheckInEntity>(
        `SELECT *
         FROM checkins
         WHERE deleted_at IS NULL
         ORDER BY recorded_at DESC
         LIMIT 200`,
    );
    const symptoms = await database.getAllAsync<CheckInSymptomEntity>(
        `SELECT checkin_symptoms.*
         FROM checkin_symptoms
         INNER JOIN checkins ON checkins.id = checkin_symptoms.checkin_id
         WHERE checkin_symptoms.deleted_at IS NULL
           AND checkins.deleted_at IS NULL
         ORDER BY checkins.recorded_at DESC`,
    );

    return { checkins, symptoms };
}
