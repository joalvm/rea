import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radii, type } from "../theme";
import { TabKey } from "../types/app.types";

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "today", label: "Hoy", icon: "calendar-heart" },
    { key: "calendar", label: "Calendario", icon: "calendar-month-outline" },
    { key: "diary", label: "Diario", icon: "notebook-outline" },
    { key: "patterns", label: "Patrones", icon: "chart-bell-curve-cumulative" },
];

interface BottomTabsProps {
    activeTab: TabKey;
    onTabChange: (tab: TabKey) => void;
}

export function BottomTabs({ activeTab, onTabChange }: BottomTabsProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            {TABS.map((tab) => {
                const active = tab.key === activeTab;
                return (
                    <Pressable
                        accessibilityRole="tab"
                        key={tab.key}
                        onPress={() => onTabChange(tab.key)}
                        style={[styles.item, active && styles.activeItem]}
                    >
                        <MaterialCommunityIcons
                            color={active ? colors.primaryDeep : colors.muted}
                            name={tab.icon as never}
                            size={22}
                        />
                        <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: colors.line,
        backgroundColor: colors.background,
        paddingTop: 8,
        paddingHorizontal: 10,
    },
    item: {
        flex: 1,
        minHeight: 54,
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        borderRadius: radii.md,
    },
    activeItem: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
    },
    label: {
        color: colors.muted,
        fontSize: type.tiny,
        fontWeight: "800",
    },
    activeLabel: {
        color: colors.primaryDeep,
    },
});
