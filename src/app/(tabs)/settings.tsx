import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import SettingsScreen from "@/features/settings/settings/SettingsScreen";

export default function SettingsRoute() {
    const router = useRouter();
    const { t } = useTranslation("settings");

    return (
        <SettingsScreen
            links={[
                {
                    label: t("context"),
                    hint: t("contextHint"),
                    onPress: () => router.push("/settings/cycle-profile"),
                },
                { label: t("notifications"), onPress: () => router.push("/settings/notifications") },
                { label: t("medications"), onPress: () => router.push("/settings/medications") },
                { label: t("pregnancy"), onPress: () => router.push("/settings/pregnancy") },
                {
                    label: t("privacy"),
                    hint: t("privacyHint"),
                    onPress: () => router.push("/settings/privacy"),
                },
                { label: t("sources"), onPress: () => router.push("/settings/sources") },
                { label: t("about"), onPress: () => router.push("/settings/about") },
                // Solo en desarrollo: siembra datos demo para verificación visual con Maestro.
                ...(typeof __DEV__ !== "undefined" && __DEV__
                    ? [
                          {
                              label: t("devSeed"),
                              hint: t("devSeedHint"),
                              testID: "dev-seed-trigger",
                              onPress: () => router.push("/dev/seed"),
                          },
                      ]
                    : []),
            ]}
        />
    );
}
