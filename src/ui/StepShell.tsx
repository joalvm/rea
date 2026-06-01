import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { accents, colors, elevations, radii, spacing, surfaces } from "../theme";
import { ScreenHeader } from "./ScreenHeader";

interface StepShellProps {
    icon: string;
    title: string;
    subtitle: string;
    children: ReactNode;
}

export function StepShell({ icon, title, subtitle, children }: StepShellProps) {
    return (
        <View style={styles.step}>
            <ScreenHeader
                align="center"
                media={
                    <View style={styles.illustration}>
                        <MaterialCommunityIcons color={colors.primaryDeep} name={icon as never} size={46} />
                    </View>
                }
                subtitle={subtitle}
                title={title}
            />
            <View style={styles.stepBody}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    step: {
        width: "100%",
        alignItems: "center",
        gap: spacing.lg,
    },
    illustration: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: surfaces.cardTinted,
        borderWidth: 1,
        borderColor: accents.primary.border,
        ...elevations.lift,
    },
    stepBody: {
        width: "100%",
        gap: 12,
        padding: spacing.md,
        borderRadius: radii.xl,
        backgroundColor: surfaces.cardRaised,
        borderWidth: 1,
        borderColor: surfaces.border,
        ...elevations.card,
    },
});
