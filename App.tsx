import { NavigationBar } from "expo-navigation-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppShell from "./src/app/AppShell";

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationBar hidden={false} style="dark" />
            <AppShell />
        </SafeAreaProvider>
    );
}
