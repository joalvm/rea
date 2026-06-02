import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { getWeekdayNarrowLabels } from "@/modules/localization/formatters";
import { colors } from "@/theme";
import { Cycle } from "@/types/cycle.types";
import { DailyLog } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";
import { BrandMark } from "@/ui/BrandMark";
import { ScreenHeader } from "@/ui/ScreenHeader";
import { SoftButton } from "@/ui/SoftButton";
import { SoftCard } from "@/ui/SoftCard";
import useCalendarModel from "./hooks/useCalendarModel";
import styles from "./CalendarScreen.styles";
import DayCell from "./components/DayCell";
import MonthHeader from "./components/MonthHeader";

/** Props del screen de calendario del ciclo. */
interface CalendarScreenProps {
    settings: AppSettings | null;
    cycles: Cycle[];
    dailyLogs: DailyLog[];
    onOpenCheckIn: () => void;
    onOpenDay: (iso: string) => void;
}

export function CalendarScreen({ settings, cycles, dailyLogs, onOpenCheckIn, onOpenDay }: CalendarScreenProps) {
    const { t } = useTranslation("calendar");
    const { days, loggedDates, monthLabel, shiftMonth, todayHasLog, todayIso } = useCalendarModel({
        settings,
        cycles,
        dailyLogs,
    });
    const weekdays = getWeekdayNarrowLabels();

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <ScreenHeader
                title={t("header.title")}
                titleIcon={<BrandMark color={colors.primaryDeep} size={24} />}
                subtitle={t("header.subtitle")}
            />

            <View style={styles.calendarPanel}>
                <MonthHeader monthLabel={monthLabel} onNext={() => shiftMonth(1)} onPrevious={() => shiftMonth(-1)} />

                <View style={styles.weekHeader}>
                    {weekdays.map((day, index) => (
                        <Text key={`${day}-${index}`} style={styles.weekday}>
                            {day}
                        </Text>
                    ))}
                </View>

                <View style={styles.grid}>
                    {days.map((day) => (
                        <DayCell
                            dayNumber={day.day}
                            inMonth={day.inMonth}
                            isLogged={loggedDates.has(day.iso)}
                            isToday={day.iso === todayIso}
                            key={day.iso}
                            onPress={() => onOpenDay(day.iso)}
                            phase={day.phase}
                            phaseSource={day.phaseSource}
                        />
                    ))}
                </View>

                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendSwatch, styles.legendSwatchObservedPeriod]} />
                        <Text style={styles.legendText}>{t("legend.observedPeriod")}</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendSwatch, styles.legendSwatchEstimatedPeriod]} />
                        <Text style={styles.legendText}>{t("legend.estimatedPeriod")}</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendSwatch, styles.legendSwatchFertile]} />
                        <Text style={styles.legendText}>{t("legend.fertileWindow")}</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendSwatch, styles.legendSwatchLuteal]} />
                        <Text style={styles.legendText}>{t("legend.luteal")}</Text>
                    </View>
                </View>
            </View>

            <SoftCard style={styles.todayCard} variant="soft">
                <View style={styles.todayCardHeader}>
                    <Text style={styles.todayCardTag}>{t("todayCard.tag")}</Text>
                    <Text style={styles.todayCardTitle}>{t("todayCard.title")}</Text>
                </View>
                <Text style={styles.todayCardText}>{todayHasLog ? t("todayCard.logged") : t("todayCard.open")}</Text>
                <SoftButton
                    label={todayHasLog ? t("todayCard.buttonLogged") : t("todayCard.buttonOpen")}
                    onPress={onOpenCheckIn}
                />
            </SoftCard>
        </ScrollView>
    );
}
