import { useMemo } from "react";
import { Text, View } from "react-native";

import { parseIsoDate, toIsoDate } from "@/modules/cycle/utils/cycleDate.utils";
import { NumberPicker } from "@/ui/NumberPicker";
import { StepShell } from "@/ui/StepShell";
import styles from "../OnboardingScreen.styles";

interface OnboardingLastPeriodStepProps {
    lastPeriodStart: string;
    onChange: (iso: string) => void;
}

/** Permite elegir la fecha base del último periodo observado. */
export default function OnboardingLastPeriodStep({ lastPeriodStart, onChange }: OnboardingLastPeriodStepProps) {
    const today = useMemo(() => parseIsoDate(toIsoDate(new Date())), []);
    const selectedDate = useMemo(() => parseIsoDate(lastPeriodStart), [lastPeriodStart]);
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth() + 1;
    const selectedDay = selectedDate.getDate();

    const updateDate = (next: { day?: number; month?: number; year?: number }) => {
        const year = next.year ?? selectedYear;
        const month = next.month ?? selectedMonth;
        const maxMonth = year === today.getFullYear() ? today.getMonth() + 1 : 12;
        const safeMonth = Math.min(month, maxMonth);
        const maxDay = getMaxDay(year, safeMonth, today);
        const day = Math.min(next.day ?? selectedDay, maxDay);
        onChange(toIsoDate(new Date(year, safeMonth - 1, day, 12, 0, 0, 0)));
    };

    return (
        <StepShell
            icon="calendar-start"
            subtitle="Elige la fecha que más se acerque. Si no recuerdas el día exacto, una aproximada sirve para empezar."
            title="¿Cuándo empezó tu última regla?"
        >
            <View style={styles.datePickerRow}>
                <View style={styles.datePickerMonth}>
                    <NumberPicker
                        formatValue={formatMonthLabel}
                        label="Mes"
                        max={selectedYear === today.getFullYear() ? today.getMonth() + 1 : 12}
                        min={1}
                        onChange={(value) => updateDate({ month: value })}
                        suffix=""
                        value={selectedMonth}
                    />
                </View>
                <View style={styles.datePickerDay}>
                    <NumberPicker
                        label="Día"
                        max={getMaxDay(selectedYear, selectedMonth, today)}
                        min={1}
                        onChange={(value) => updateDate({ day: value })}
                        suffix=""
                        value={selectedDay}
                    />
                </View>
            </View>
            <NumberPicker
                label="Año"
                max={today.getFullYear()}
                min={today.getFullYear() - 5}
                onChange={(value) => updateDate({ year: value })}
                suffix=""
                value={selectedYear}
            />
            <Text style={styles.helperText}>Fecha elegida: {formatLongDate(lastPeriodStart)}</Text>
        </StepShell>
    );
}

function getMaxDay(year: number, month: number, today: Date) {
    const daysInMonth = new Date(year, month, 0, 12, 0, 0, 0).getDate();
    if (year === today.getFullYear() && month === today.getMonth() + 1) {
        return Math.min(daysInMonth, today.getDate());
    }

    return daysInMonth;
}

function formatMonthLabel(month: number) {
    const label = new Date(2026, month - 1, 1, 12, 0, 0, 0).toLocaleDateString("es-PE", { month: "long" });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatLongDate(iso: string) {
    return parseIsoDate(iso).toLocaleDateString("es-PE", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}
