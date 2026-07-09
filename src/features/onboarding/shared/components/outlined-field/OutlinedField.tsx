import { useState } from "react";
import { TextInput } from "react-native";

import { useTheme } from "@/theme/useTheme";

import { useOutlinedFieldStyles } from "./OutlinedFieldStyle";

type Props = {
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
    testID?: string;
    accessibilityLabel?: string;
};

export function OutlinedField({ value, onChangeText, placeholder, testID, accessibilityLabel }: Props) {
    const theme = useTheme();
    const styles = useOutlinedFieldStyles();
    const [focused, setFocused] = useState(false);

    return (
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.placeholder}
            testID={testID}
            accessibilityLabel={accessibilityLabel ?? placeholder}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={[styles.field, focused && styles.focused]}
        />
    );
}
