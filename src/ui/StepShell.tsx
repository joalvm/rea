import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, shadow, type } from "../theme";

interface StepShellProps {
    icon: string;
    title: string;
    subtitle: string;
    children: ReactNode;
}

export function StepShell({ icon, title, subtitle, children }: StepShellProps) {
    return (
        <View style={styles.step}>
            <View style={styles.illustration}>
                <MaterialCommunityIcons color={colors.primaryDeep} name={icon as never} size={66} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.stepBody}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    step: {
        alignItems: "center",
    },
    illustration: {
        width: 150,
        height: 150,
        borderRadius: 75,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primarySoft,
        marginBottom: 26,
        ...shadow,
    },
    title: {
        color: colors.ink,
        fontSize: 28,
        lineHeight: 34,
        fontWeight: "900",
        textAlign: "center",
    },
    subtitle: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
        textAlign: "center",
        marginTop: 10,
    },
    stepBody: {
        width: "100%",
        marginTop: 26,
        gap: 14,
    },
});
