import TabIcon from "@/components/tab-icon/TabIcon";
import { Tabs } from "expo-router";
import { CalendarDaysIcon, ChartSplineIcon, HouseIcon, NotebookTabsIcon, Settings2Icon } from "lucide-react-native";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#C71585",
                tabBarInactiveTintColor: "#9CA3AF",
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Inicio",
                    tabBarIcon: ({ color, focused }) => <TabIcon Icon={HouseIcon} color={color} focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="diary"
                options={{
                    title: "Diario",
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon Icon={NotebookTabsIcon} color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: "Calendario",
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon Icon={CalendarDaysIcon} color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: "Estadísticas",
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon Icon={ChartSplineIcon} color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Configuración",
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon Icon={Settings2Icon} color={color} focused={focused} />
                    ),
                }}
            />
        </Tabs>
    );
}
