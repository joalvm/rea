import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, ViewStyle } from "react-native";

interface BubbleProps {
    size: number;
    color: string;
    delay: number;
    travel: number;
    style: ViewStyle;
}

interface FloatingBubblesProps {
    palette?: string[];
}

const defaultPalette: [string, string, string, string] = [
    "rgba(255,255,255,0.30)",
    "rgba(207,194,235,0.18)",
    "rgba(255,255,255,0.18)",
    "rgba(255,231,238,0.22)",
];

export function FloatingBubbles({ palette }: FloatingBubblesProps) {
    const bubblePalette: [string, string, string, string] = [
        palette?.[0] ?? defaultPalette[0],
        palette?.[1] ?? defaultPalette[1],
        palette?.[2] ?? defaultPalette[2],
        palette?.[3] ?? defaultPalette[3],
    ];

    return (
        <>
            <Bubble color={bubblePalette[0]} delay={10} size={86} style={styles.one} travel={12} />
            <Bubble color={bubblePalette[1]} delay={210} size={52} style={styles.two} travel={9} />
            <Bubble color={bubblePalette[2]} delay={420} size={40} style={styles.three} travel={8} />
            <Bubble color={bubblePalette[3]} delay={640} size={48} style={styles.four} travel={10} />
        </>
    );
}

function Bubble({ size, color, delay, travel, style }: BubbleProps) {
    const [progress] = useState(() => new Animated.Value(0));

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(progress, {
                    duration: 3300,
                    easing: Easing.inOut(Easing.quad),
                    toValue: 1,
                    useNativeDriver: true,
                }),
                Animated.timing(progress, {
                    duration: 3300,
                    easing: Easing.inOut(Easing.quad),
                    toValue: 0,
                    useNativeDriver: true,
                }),
            ]),
        );
        animation.start();
        return () => animation.stop();
    }, [delay, progress]);

    const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -travel] });
    const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.bubble,
                style,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    transform: [{ translateY }, { scale }],
                },
            ]}
        />
    );
}

const styles = StyleSheet.create({
    bubble: {
        position: "absolute",
    },
    one: {
        left: -10,
        top: 138,
    },
    two: {
        left: 22,
        bottom: 150,
    },
    three: {
        right: 82,
        bottom: 122,
    },
    four: {
        left: 72,
        bottom: 126,
    },
});
