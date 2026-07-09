import { useMemo } from "react";
import { View } from "react-native";

import { WheelGroup } from "../wheel-group/WheelGroup";
import { WheelPicker } from "../wheel-picker/WheelPicker";
import { useDateWheelStyles } from "./DateWheelStyle";

export type DateParts = {
    day: number;
    month: number;
    year: number;
};

type Props = {
    value: DateParts;
    onChange: (value: DateParts) => void;
    monthLabels: readonly string[];
    minYear: number;
    maxYear: number;
    /** Límite superior seleccionable (inclusive). Bloquea meses/días futuros. */
    max?: DateParts;
    testID?: string;
};

function daysInMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
}

function range(from: number, to: number, format: (value: number) => string = (value) => String(value)) {
    const items: string[] = [];
    for (let value = from; value <= to; value += 1) {
        items.push(format(value));
    }
    return items;
}

/** Mayor mes seleccionable para `year`, respetando `max`. */
function monthCeiling(year: number, max?: DateParts) {
    return max && year >= max.year ? max.month : 12;
}

/** Mayor día seleccionable para `year`/`month`, respetando longitud de mes y `max`. */
function dayCeiling(year: number, month: number, max?: DateParts) {
    const monthDays = daysInMonth(year, month);
    if (max && year >= max.year && month >= max.month) {
        return Math.min(monthDays, max.day);
    }
    return monthDays;
}

/** Recorta una fecha a los topes de mes/día vigentes (al cambiar año o mes). */
function clampParts(value: DateParts, max?: DateParts): DateParts {
    const month = Math.min(value.month, monthCeiling(value.year, max));
    const day = Math.min(value.day, dayCeiling(value.year, month, max));
    return { year: value.year, month, day };
}

export function DateWheel({ value, onChange, monthLabels, minYear, maxYear, max, testID }: Props) {
    const styles = useDateWheelStyles();

    const monthMax = monthCeiling(value.year, max);
    const month = Math.min(value.month, monthMax);
    const dayMax = dayCeiling(value.year, month, max);
    const day = Math.min(value.day, dayMax);

    const dayItems = useMemo(() => range(1, dayMax, (n) => String(n).padStart(2, "0")), [dayMax]);
    const monthItems = useMemo(() => monthLabels.slice(0, monthMax), [monthLabels, monthMax]);
    const yearItems = useMemo(() => range(minYear, maxYear), [minYear, maxYear]);

    return (
        <WheelGroup testID={testID}>
            <View style={styles.day}>
                <WheelPicker
                    items={dayItems}
                    valueIndex={day - 1}
                    onChange={(index) => onChange(clampParts({ ...value, day: index + 1 }, max))}
                />
            </View>
            <View style={styles.month}>
                <WheelPicker
                    items={monthItems}
                    valueIndex={month - 1}
                    onChange={(index) => onChange(clampParts({ ...value, month: index + 1 }, max))}
                />
            </View>
            <View style={styles.year}>
                <WheelPicker
                    items={yearItems}
                    valueIndex={value.year - minYear}
                    onChange={(index) => onChange(clampParts({ ...value, year: minYear + index }, max))}
                />
            </View>
        </WheelGroup>
    );
}
