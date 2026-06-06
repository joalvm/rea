import { AppStoreData } from "@/types/app.types";

import getDatabase from "../connection";
import {
    CheckInEntity,
    CheckInMedicationEntity,
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
} from "./loadAppStoreDataMappers";

/** Carga modelos de vista desde el esquema normalizado vigente. */
export default async function loadAppStoreData(): Promise<AppStoreData> {
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
        periodHistory: periodRuns.map(mapPeriodRunToCycle),
        checkInMoments: checkInRows.checkins.map(mapCheckInToMoment),
        dailyRecords: buildDailyLogs(checkInRows),
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
    const medications = await database.getAllAsync<CheckInMedicationEntity & { medication_name: string }>(
        `SELECT checkin_medications.*, medication_catalog.name AS medication_name
         FROM checkin_medications
         INNER JOIN checkins ON checkins.id = checkin_medications.checkin_id
         INNER JOIN medication_catalog ON medication_catalog.id = checkin_medications.medication_id
         WHERE checkin_medications.deleted_at IS NULL
           AND checkins.deleted_at IS NULL
           AND medication_catalog.deleted_at IS NULL
         ORDER BY checkin_medications.taken_at DESC`,
    );

    return { checkins, medications, symptoms };
}
