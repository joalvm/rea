import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, type } from "../theme";
import { TabKey } from "../types";

const TABS: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: "today", label: "Hoy", icon: "calendar-heart" },
  { key: "calendar", label: "Calendario", icon: "calendar-month-outline" },
  { key: "diary", label: "Diario", icon: "notebook-outline" },
  { key: "patterns", label: "Patrones", icon: "chart-bell-curve-cumulative" }
];

interface BottomTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export function BottomTabs({ activeTab, onTabChange }: BottomTabsProps) {
  return (
    <View style={styles.wrap}>
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
    borderTopColor: "rgba(8, 124, 155, 0.08)",
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingTop: 8,
    paddingBottom: 14,
    paddingHorizontal: 10
  },
  item: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 18
  },
  activeItem: {
    backgroundColor: colors.primarySoft
  },
  label: {
    color: colors.muted,
    fontSize: type.tiny,
    fontWeight: "800"
  },
  activeLabel: {
    color: colors.primaryDeep
  }
});
