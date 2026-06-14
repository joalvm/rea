import { Redirect } from "expo-router";

const HAS_COMPLETED_ONBOARDING = false;

export default function Index() {
    if (!HAS_COMPLETED_ONBOARDING) {
        return <Redirect href="/(onboarding)/welcome" />;
    }

    return <Redirect href="/(tabs)" />;
}
