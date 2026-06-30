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

export function DateWheel({ value, onChange, monthLabels, minYear, maxYear, testID }: Props) {
    const styles = useDateWheelStyles();

    const maxDay = daysInMonth(value.year, value.month);
    const day = Math.min(value.day, maxDay);
    const dayItems = useMemo(() => range(1, 31, (n) => String(n).padStart(2, "0")), []);
    const monthItems = useMemo(() => monthLabels.slice(0, 12), [monthLabels]);
    const yearItems = useMemo(() => range(minYear, maxYear), [minYear, maxYear]);

    return (
        <WheelGroup testID={testID}>
            <View style={styles.day}>
                <WheelPicker
                    items={dayItems}
                    valueIndex={day - 1}
                    onChange={(index) => onChange({ ...value, day: index + 1 })}
                />
            </View>
            <View style={styles.month}>
                <WheelPicker
                    items={monthItems}
                    valueIndex={value.month - 1}
                    onChange={(index) =>
                        onChange({
                            ...value,
                            month: index + 1,
                            day: Math.min(value.day, daysInMonth(value.year, index + 1)),
                        })
                    }
                />
            </View>
            <View style={styles.year}>
                <WheelPicker
                    items={yearItems}
                    valueIndex={value.year - minYear}
                    onChange={(index) =>
                        onChange({
                            ...value,
                            year: minYear + index,
                            day: Math.min(value.day, daysInMonth(minYear + index, value.month)),
                        })
                    }
                />
            </View>
        </WheelGroup>
    );
}
