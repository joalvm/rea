import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, ViewStyle } from "react-native";

interface BubbleProps {
    size: number;
    color: string;
    delay: number;
    travel: number;
    style: ViewStyle;
}

export function FloatingBubbles() {
    return (
        <>
            <Bubble color="rgba(255,255,255,0.46)" delay={0} size={118} style={styles.one} travel={16} />
            <Bubble color="rgba(124,217,249,0.38)" delay={260} size={76} style={styles.two} travel={12} />
            <Bubble color="rgba(143,220,195,0.28)" delay={520} size={54} style={styles.three} travel={10} />
            <Bubble color="rgba(255,231,238,0.58)" delay={780} size={68} style={styles.four} travel={14} />
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
                    duration: 3800,
                    easing: Easing.inOut(Easing.quad),
                    toValue: 1,
                    useNativeDriver: true,
                }),
                Animated.timing(progress, {
                    duration: 3800,
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
        left: -36,
        top: 128,
    },
    two: {
        right: 22,
        top: 124,
    },
    three: {
        right: 92,
        bottom: 84,
    },
    four: {
        left: 74,
        bottom: 104,
    },
});
