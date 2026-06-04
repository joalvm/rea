import { NavigationBar } from "expo-navigation-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import LocalizationProvider from "./src/modules/localization/LocalizationProvider";
import AppShell from "./src/app/AppShell";

export default function App() {
    return (
        <SafeAreaProvider>
            <LocalizationProvider>
                <NavigationBar hidden={false} style="dark" />
                <AppShell />
            </LocalizationProvider>
        </SafeAreaProvider>
    );
}
