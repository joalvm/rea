import { useEffect } from "react";
import { Pressable, Text } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

import { useSnackbarStyles } from "./SnackbarStyle";
import { useFeedbackStore } from "@/shared/feedback/useFeedbackStore";

/**
 * Snackbar global: Lee del `useFeedbackStore` y se anima con Reanimated. Monta
 * un único snackbar a la vez; si llega uno nuevo mientras otro está visible,
 * `showCount` reinicia el timer de auto-cierre.
 *
 * El auto-cierre se gestiona aquí (no en el store) para respetar el ciclo de
 * vida de React y limpiar el `setTimeout` al desmontar.
 */
export function Snackbar() {
    const { visible, message, action, durationMs, showCount, dismiss } = useFeedbackStore();
    const styles = useSnackbarStyles();

    useEffect(() => {
        if (!visible) return;
        const id = setTimeout(dismiss, durationMs);
        return () => clearTimeout(id);
    }, [visible, showCount, durationMs, dismiss]);

    if (!visible || !message) return null;

    return (
        <Animated.View
            // `showCount` en la key fuerza remount → reinicia la animación al
            // mostrar un nuevo snackbar mientras uno estaba visible.
            key={`snackbar-${showCount}`}
            entering={FadeInDown.springify().damping(18).stiffness(220)}
            exiting={FadeOutDown.duration(180)}
            style={styles.wrap}
            pointerEvents="box-none"
        >
            <Pressable style={styles.bar} onPress={dismiss} accessibilityRole="alert">
                <Text style={styles.message}>{message}</Text>
                {action ? (
                    <Pressable
                        style={styles.action}
                        onPress={() => {
                            action.onPress();
                            dismiss();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={action.label}
                        hitSlop={8}
                    >
                        <Text style={styles.actionLabel}>{action.label}</Text>
                    </Pressable>
                ) : null}
            </Pressable>
        </Animated.View>
    );
}
