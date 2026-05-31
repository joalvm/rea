import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";

import { colors, interactions } from "../theme";

interface IconButtonProps {
    icon: string;
    label: string;
    onPress: () => void;
    color?: string;
    backgroundColor?: string;
    style?: StyleProp<ViewStyle>;
}

export function IconButton({
    icon,
    label,
    onPress,
    color = colors.primaryDeep,
    backgroundColor = "rgba(255,255,255,0.82)",
    style,
}: IconButtonProps) {
    return (
        <Pressable
            accessibilityLabel={label}
            accessibilityRole="button"
            hitSlop={10}
            onPress={onPress}
            style={({ pressed }) => [styles.button, { backgroundColor }, pressed && styles.pressed, style]}
        >
            <MaterialCommunityIcons color={color} name={icon as never} size={23} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    pressed: {
        transform: [{ scale: interactions.pressScaleStrong }, { translateY: interactions.pressTranslateY }],
        opacity: interactions.pressOpacity,
    },
});
