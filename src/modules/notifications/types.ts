import type { NotificationContentInput, SchedulableNotificationTriggerInput } from "expo-notifications";

/**
 * Tipos de notificación local que programa Rea. Cada uno tiene su disparador,
 * su toggle granular en `app_settings` y su copy. La fase 1 solo implementa
 * `daily_checkin`; los predictivos llegan en la fase 2 (M4).
 */
export type NotificationType = "daily_checkin";

/**
 * Copy mostrado por una notificación. Vive fuera del módulo para que
 * `buildContent` siga siendo una función pura: el caller (el orquestador) le
 * pasa los strings resueltos vía i18n.
 */
export type NotificationCopy = {
    title: string;
    body: string;
};

/**
 * Configuración que el orquestador necesita para decidir qué programar.
 * Refleja un subconjunto de `app_settings` (no la fila entera).
 */
export type NotificationSettings = {
    remindersEnabled: boolean;
    notifyDailyCheckin: boolean;
    discreetNotifications: boolean;
};

/** Destino al abrir la notificación (deep link `rea://...`). */
export type NotificationDeepLink = `/checkin` | `/(tabs)`;

/** Instancia lista para programar: identificador estable + trigger + content. */
export type NotificationInstance = {
    id: string;
    type: NotificationType;
    trigger: SchedulableNotificationTriggerInput;
    content: NotificationContentInput;
};

/** Texto del cuerpo según modo (discreto vs explícito). */
export type NotificationContentPayload = NotificationContentInput;
