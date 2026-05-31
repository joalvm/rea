import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { accents, colors, elevations, interactions, radii, screen, surfaces, type } from "../theme";
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
    const safeBottomPadding = Math.max(insets.bottom - 2, 10);

    return (
        <View style={[styles.wrap, { paddingBottom: safeBottomPadding }]}>
            {TABS.map((tab) => {
                const active = tab.key === activeTab;
                return (
                    <Pressable
                        accessibilityRole="tab"
                        key={tab.key}
                        onPress={() => onTabChange(tab.key)}
                        style={({ pressed }) => [
                            styles.item,
                            active && styles.activeItem,
                            pressed && styles.itemPressed,
                            pressed && active && styles.activeItemPressed,
                            pressed && !active && styles.inactiveItemPressed,
                        ]}
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
        borderTopColor: surfaces.borderSoft,
        backgroundColor: surfaces.tabBar,
        paddingTop: screen.tabBarTopPadding,
        paddingHorizontal: 12,
        gap: 6,
    },
    item: {
        flex: 1,
        minHeight: 56,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        borderRadius: radii.lg,
    },
    activeItem: {
        backgroundColor: surfaces.cardRaised,
        borderWidth: 1,
        borderColor: accents.primary.border,
        ...elevations.card,
    },
    itemPressed: {
        transform: [{ scale: interactions.pressScaleSoft }, { translateY: interactions.pressTranslateY }],
    },
    inactiveItemPressed: {
        backgroundColor: accents.neutral.tint,
        opacity: interactions.pressOpacity,
    },
    activeItemPressed: {
        borderColor: accents.primary.ink,
        opacity: 0.98,
    },
    label: {
        color: colors.muted,
        fontSize: type.tiny,
        fontWeight: "800",
    },
    activeLabel: {
        color: colors.primaryInk,
    },
});
