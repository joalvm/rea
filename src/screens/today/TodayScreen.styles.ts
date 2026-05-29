import { StyleSheet } from "react-native";

import { colors, radii, shadow, type } from "../../theme";

const styles = StyleSheet.create({
    content: {
        paddingBottom: 32,
        backgroundColor: colors.background,
    },
    hero: {
        minHeight: 492,
        marginBottom: 92,
        overflow: "visible",
    },
    heroGlow: {
        position: "absolute",
        width: 196,
        height: 196,
        borderRadius: 98,
        right: -18,
        top: 116,
    },
    heroCurve: {
        position: "absolute",
        left: -36,
        right: -36,
        bottom: -78,
        height: 124,
        borderBottomLeftRadius: 150,
        borderBottomRightRadius: 150,
        zIndex: 1,
    },
    heroContent: {
        zIndex: 2,
        paddingTop: 54,
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    date: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    phaseBlock: {
        alignItems: "center",
        marginTop: 34,
    },
    phaseHeading: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    phaseHeadingText: {
        fontSize: 22,
        lineHeight: 26,
        fontWeight: "900",
    },
    phaseDayRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 10,
        marginTop: 8,
    },
    dayBadge: {
        position: "absolute",
        top: 10,
        left: -25,
        minHeight: 22,
        borderRadius: 12,
        paddingHorizontal: 0,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        marginBottom: 8,
    },
    dayBadgeText: {
        fontSize: type.tiny,
        fontWeight: "800",
        paddingHorizontal: 4,
    },
    phaseDay: {
        fontSize: 64,
        lineHeight: 66,
        fontWeight: "900",
    },
    phaseMessage: {
        fontSize: type.body,
        lineHeight: 22,
        textAlign: "center",
        marginTop: 12,
        maxWidth: 314,
    },
    phaseSupport: {
        fontSize: type.small,
        lineHeight: 18,
        textAlign: "center",
        marginTop: 10,
        maxWidth: 320,
    },
    heroStats: {
        alignSelf: "center",
        marginTop: 18,
        minHeight: 64,
        width: "100%",
        maxWidth: 342,
        borderRadius: radii.lg,
        backgroundColor: "rgba(255,255,255,0.72)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.72)",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        ...shadow,
    },
    miniStat: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    miniStatCopy: {
        flex: 1,
        minWidth: 0,
    },
    miniStatLabel: {
        color: colors.muted,
        fontSize: type.tiny,
        fontWeight: "900",
    },
    miniStatValue: {
        color: colors.ink,
        fontSize: type.small,
        fontWeight: "900",
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 36,
        backgroundColor: "rgba(8,124,155,0.12)",
        marginHorizontal: 12,
    },
    heroButton: {
        alignSelf: "center",
        marginTop: 26,
        minWidth: 184,
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 20,
        gap: 12,
    },
    firstSection: {
        marginTop: 4,
    },
    sectionTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    quickCards: {
        gap: 12,
        paddingRight: 20,
    },
    alertCard: {
        gap: 14,
    },
    alertRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-start",
    },
    alertBadge: {
        minHeight: 28,
        minWidth: 76,
        borderRadius: 14,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    alertBadgeText: {
        fontSize: type.small,
        fontWeight: "900",
    },
    alertCopy: {
        flex: 1,
        gap: 4,
    },
    alertTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    alertText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
    careCard: {
        gap: 14,
    },
    careRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    careIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    careText: {
        flex: 1,
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 22,
        fontWeight: "700",
    },
    insightCard: {
        gap: 14,
    },
    insightRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-start",
    },
    insightDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    insightDotWatch: {
        backgroundColor: colors.periodSoft,
    },
    insightCopy: {
        flex: 1,
        gap: 4,
    },
    insightTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    insightText: {
        flex: 1,
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 22,
    },
    emptyText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
});

export default styles;
