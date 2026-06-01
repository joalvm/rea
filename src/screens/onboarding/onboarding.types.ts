import { NotificationCadence } from "@/types/notifications.types";
import { AppSettings } from "@/types/settings.types";

/** Dependencias mínimas para controlar el flujo de onboarding. */
export interface OnboardingFlowConfig {
    onComplete: (settings: AppSettings, notificationCadence: NotificationCadence) => Promise<void>;
}
