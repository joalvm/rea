import { useEffect, useRef, useState } from "react";
import { type NativeScrollEvent, ScrollView, Text, View, type NativeSyntheticEvent } from "react-native";

import { WHEEL_ITEM_HEIGHT, useWheelPickerStyles } from "./WheelPickerStyle";

type Props = {
    items: readonly string[];
    valueIndex: number;
    onChange: (index: number) => void;
    testID?: string;
};

export function WheelPicker({ items, valueIndex, onChange, testID }: Props) {
    const styles = useWheelPickerStyles();
    const scrollRef = useRef<ScrollView>(null);
    const [centerIndex, setCenterIndex] = useState(valueIndex);

    useEffect(() => {
        const id = requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ y: valueIndex * WHEEL_ITEM_HEIGHT, animated: false });
        });
        return () => cancelAnimationFrame(id);
    }, [valueIndex]);

    const clamp = (index: number) => Math.max(0, Math.min(items.length - 1, index));

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = clamp(Math.round(event.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT));
        setCenterIndex((prev) => (prev !== index ? index : prev));
    };

    const settle = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = clamp(Math.round(event.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT));
        if (index !== valueIndex) {
            onChange(index);
        }
    };

    return (
        <View style={styles.wheel} testID={testID}>
            <View style={styles.band} pointerEvents="none" />
            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={WHEEL_ITEM_HEIGHT}
                decelerationRate="fast"
                onScroll={handleScroll}
                scrollEventThrottle={32}
                onScrollEndDrag={settle}
                onMomentumScrollEnd={settle}
                contentContainerStyle={styles.scrollContent}
            >
                {items.map((item, index) => {
                    const distance = Math.abs(index - centerIndex);
                    const itemStyle =
                        distance === 0 ? styles.itemCenter : distance === 1 ? styles.itemNear : styles.itemFar;
                    return (
                        <Text key={`${index}-${item}`} style={itemStyle}>
                            {item}
                        </Text>
                    );
                })}
            </ScrollView>
        </View>
    );
}
