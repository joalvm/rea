import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors, screen, spacing, type, weights } from "@/theme";

interface ScreenHeaderProps {
    title: string;
    titleIcon?: ReactNode;
    titleColor?: string;
    kicker?: string;
    subtitle?: string;
    leading?: ReactNode;
    trailing?: ReactNode;
    media?: ReactNode;
    align?: "left" | "center";
    style?: StyleProp<ViewStyle>;
}

/** Renderiza encabezado editorial compartido para pantallas principales. */
export function ScreenHeader({
    title,
    titleIcon,
    titleColor = colors.primaryDeep,
    kicker,
    subtitle,
    leading,
    trailing,
    media,
    align = "left",
    style,
}: ScreenHeaderProps) {
    const centered = align === "center";

    return (
        <View style={[styles.header, centered && styles.headerCentered, style]}>
            {media ? <View style={[styles.media, centered && styles.mediaCentered]}>{media}</View> : null}

            <View style={styles.row}>
                {leading ? <View style={styles.leading}>{leading}</View> : null}

                <View style={[styles.copy, centered && styles.copyCentered]}>
                    {kicker ? <Text style={[styles.kicker, centered && styles.kickerCentered]}>{kicker}</Text> : null}
                    <View style={[styles.titleRow, centered && styles.titleRowCentered]}>
                        {titleIcon ? <View style={styles.titleIcon}>{titleIcon}</View> : null}
                        <Text style={[styles.title, { color: titleColor }, centered && styles.titleCentered]}>
                            {title}
                        </Text>
                    </View>
                    {subtitle ? (
                        <Text style={[styles.subtitle, centered && styles.subtitleCentered]}>{subtitle}</Text>
                    ) : null}
                </View>

                {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        gap: screen.headerGap,
    },
    headerCentered: {
        alignItems: "center",
    },
    media: {
        alignSelf: "flex-start",
    },
    mediaCentered: {
        alignSelf: "center",
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.sm,
        width: "100%",
    },
    leading: {
        paddingTop: 2,
    },
    trailing: {
        marginLeft: spacing.sm,
    },
    copy: {
        flex: 1,
        gap: 6,
    },
    copyCentered: {
        alignItems: "center",
    },
    kicker: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: weights.black,
        letterSpacing: screen.kickerTracking,
        textTransform: "uppercase",
    },
    kickerCentered: {
        textAlign: "center",
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
    },
    titleRowCentered: {
        justifyContent: "center",
    },
    titleIcon: {
        paddingTop: 0,
    },
    title: {
        fontSize: screen.titleSize,
        lineHeight: screen.titleLineHeight,
        fontWeight: weights.black,
        flexShrink: 1,
        maxWidth: screen.maxTextWidth,
    },
    titleCentered: {
        textAlign: "center",
    },
    subtitle: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: screen.subtitleLineHeight,
        maxWidth: screen.maxTextWidth,
    },
    subtitleCentered: {
        textAlign: "center",
    },
});
