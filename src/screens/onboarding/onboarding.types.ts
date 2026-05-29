import { NotificationMoment } from "../../types/notifications.types";
import { AppSettings } from "../../types/settings.types";

/** Props del flujo inicial de onboarding. */
export interface OnboardingScreenProps {
    onComplete: (settings: AppSettings, moments: NotificationMoment[]) => Promise<void>;
}

/** Dependencias mínimas para controlar el flujo de onboarding. */
export interface OnboardingFlowConfig {
    onComplete: (settings: AppSettings, moments: NotificationMoment[]) => Promise<void>;
}
