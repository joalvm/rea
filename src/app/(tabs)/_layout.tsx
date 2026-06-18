import { TabIcon } from "@/components/tab-icon/TabIcon";
import { useTheme } from "@/theme/useTheme";
import { Tabs } from "expo-router";
import { CalendarDaysIcon, ChartSplineIcon, HouseIcon, NotebookTabsIcon, Settings2Icon } from "lucide-react-native";

export default function TabLayout() {
    const theme = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.tabBarActive,
                tabBarInactiveTintColor: theme.colors.tabBarInactive,
                tabBarStyle: {
                    backgroundColor: theme.colors.tabBarBackground,
                    borderTopColor: theme.colors.tabBarBorder,
                    borderTopWidth: theme.borderWidth.hairline,
                },
                tabBarLabelStyle: {
                    fontSize: theme.typography.sizes.caption,
                    fontWeight: theme.typography.weights.medium,
                },
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
