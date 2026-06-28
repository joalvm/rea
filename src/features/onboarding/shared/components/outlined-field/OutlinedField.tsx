import { useState } from "react";
import { TextInput } from "react-native";

import { useOutlinedFieldStyles } from "./OutlinedFieldStyle";

type Props = {
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
    testID?: string;
    accessibilityLabel?: string;
};

export function OutlinedField({ value, onChangeText, placeholder, testID, accessibilityLabel }: Props) {
    const styles = useOutlinedFieldStyles();
    const [focused, setFocused] = useState(false);

    return (
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9AA0A6"
            testID={testID}
            accessibilityLabel={accessibilityLabel ?? placeholder}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={[styles.field, focused && styles.focused]}
        />
    );
}
