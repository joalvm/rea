import { NotificationMoment } from "@/types/notifications.types";

import db from "../core/database";

/** Reemplaza horarios guardados por conjunto reprogramado actual. */
export async function saveNotificationMoments(moments: NotificationMoment[]) {
    const database = db();
    await database.withTransactionAsync(async () => {
        await database.runAsync("DELETE FROM notification_moments");
        for (const moment of moments) {
            await database.runAsync(
                "INSERT INTO notification_moments (id, label, time, enabled, days, type, question, notificationIds) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                moment.id,
                moment.label,
                moment.time,
                moment.enabled ? 1 : 0,
                JSON.stringify(moment.days),
                moment.type,
                moment.question,
                JSON.stringify(moment.notificationIds ?? []),
            );
        }
    });
}

/** Carga recordatorios persistidos ordenados por hora. */
export async function loadNotificationMoments(): Promise<NotificationMoment[]> {
    const rows = await db().getAllAsync<{
        id: string;
        label: string;
        time: string;
        enabled: number;
        days: string;
        type: NotificationMoment["type"];
        question: string;
        notificationIds: string;
    }>("SELECT * FROM notification_moments ORDER BY time ASC");

    return rows.map((row) => ({
        id: row.id,
        label: row.label,
        time: row.time,
        enabled: row.enabled === 1,
        days: JSON.parse(row.days) as number[],
        type: row.type,
        question: row.question,
        notificationIds: JSON.parse(row.notificationIds) as string[],
    }));
}
