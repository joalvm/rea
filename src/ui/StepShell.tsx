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
                        <MaterialCommunityIcons color={colors.primaryDeep} name={icon as never} size={64} />
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
        gap: spacing.xl,
    },
    illustration: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: surfaces.cardTinted,
        borderWidth: 1,
        borderColor: accents.primary.border,
        ...elevations.lift,
    },
    stepBody: {
        width: "100%",
        gap: 14,
        padding: spacing.lg,
        borderRadius: radii.xl,
        backgroundColor: surfaces.cardRaised,
        borderWidth: 1,
        borderColor: surfaces.border,
        ...elevations.card,
    },
});
