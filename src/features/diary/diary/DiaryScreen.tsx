import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { useTheme } from "@/theme/useTheme";

import { DayCard } from "./components/DayCard";
import { useMonthCursor } from "./hooks/useMonthCursor";
import { useCheckins } from "./hooks/useCheckins";
import { groupByDay } from "./utils/groupByDay";
import { useDiaryStyles } from "./DiaryStyle";

/**
 * Tab Diario: lista cronológica de registros agrupados por día, con selector de
 * mes (flechas ‹ ›) y navegación al detalle (`diary/[date]`). Fase 1: solo
 * lectura. La edición/borrado llega en la Fase 2.
 */
export default function DiaryScreen() {
    const styles = useDiaryStyles();
    const theme = useTheme();
    const { t } = useTranslation();
    const router = useRouter();
    const { profile } = useLocalProfile();
    const { range, label, prev, next, reset, isCurrent } = useMonthCursor();
    const { items } = useCheckins(profile?.id, range);
    const groups = useMemo(() => groupByDay(items), [items]);

    const monthLabel = `${t(`diary:months.${label.month}`)} ${label.year}`;

    const handleOpenDay = (localDate: string) => {
        router.push(`/diary/${localDate}`);
    };

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>{t("diary:tab.title")}</Text>
                <Text style={styles.subtitle}>{t("diary:tab.subtitle")}</Text>
            </View>

            <View style={styles.monthBar}>
                <Pressable
                    onPress={prev}
                    accessibilityRole="button"
                    accessibilityLabel={t("diary:month.prev")}
                    style={({ pressed }) => [styles.monthNavButton, pressed && { opacity: 0.5 }]}
                >
                    <ChevronLeft size={theme.sizing.iconMd} color={theme.colors.text} strokeWidth={2.4} />
                </Pressable>

                <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
                    <Text style={styles.monthLabel}>{monthLabel}</Text>
                    {!isCurrent ? (
                        <Pressable
                            onPress={reset}
                            style={styles.todayChip}
                            accessibilityRole="button"
                            accessibilityLabel={t("diary:month.today")}
                        >
                            <Text style={styles.todayChipText}>{t("diary:month.today")}</Text>
                        </Pressable>
                    ) : null}
                </View>

                <Pressable
                    onPress={next}
                    accessibilityRole="button"
                    accessibilityLabel={t("diary:month.next")}
                    style={({ pressed }) => [styles.monthNavButton, pressed && { opacity: 0.5 }]}
                >
                    <ChevronRight size={theme.sizing.iconMd} color={theme.colors.text} strokeWidth={2.4} />
                </Pressable>
            </View>

            <View style={styles.listWrap}>
                {groups.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>{t("diary:list.empty")}</Text>
                    </View>
                ) : (
                    groups.map((group) => (
                        <DayCard
                            key={group.localDate}
                            group={group}
                            onPress={handleOpenDay}
                            t={t}
                            testID={`diary-day-${group.localDate}`}
                        />
                    ))
                )}
            </View>
        </ScrollView>
    );
}
