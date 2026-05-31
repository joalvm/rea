import { colors } from "@/theme";
import { PhaseKey } from "@/types/cycle.types";
import { TodayHeroTheme } from "../today.types";

/** Devuelve paleta editorial del hero según fase actual. */
export default function getHeroTheme(phase: PhaseKey): TodayHeroTheme {
    const baseTheme: TodayHeroTheme = {
        background: colors.lutealSoft,
        glow: "rgba(122,94,201,0.08)",
        bubbleColors: [
            "rgba(255,255,255,0.22)",
            "rgba(207,194,235,0.16)",
            "rgba(255,255,255,0.16)",
            "rgba(233,226,248,0.18)",
        ],
        iconButtonColor: "#6C59A8",
        iconButtonBackground: "rgba(255,255,255,0.82)",
        phaseIcon: "circle-outline",
        scenePillColor: "#6C59A8",
        titleColor: "#5B4C7E",
        messageColor: "#5E5279",
        supportColor: "#7D7097",
        dayBadgeBackground: "rgba(122,94,201,0.08)",
        dayBadgeBorder: "rgba(122,94,201,0.12)",
        dayBadgeColor: "#8D7DAF",
        statCardBackground: "rgba(255,255,255,0.78)",
        statCardBorder: "rgba(255,255,255,0.72)",
        statIconColor: "#6C59A8",
        statLabelColor: "#7D7097",
        statValueColor: colors.ink,
        dividerColor: "rgba(122,94,201,0.12)",
        buttonBackground: "rgba(255,255,255,0.88)",
        buttonBorder: "rgba(122,94,201,0.32)",
        buttonTextColor: "#6C59A8",
        weekPalette: {
            weekdayColor: "#7D7097",
            todayWeekdayColor: "#5E5279",
            dayTextColor: colors.ink,
            todayBackgroundColor: "#6C59A8",
            todayDayTextColor: colors.surface,
        },
    };

    if (phase === "menstrual") {
        return {
            ...baseTheme,
            background: colors.periodSoft,
            glow: "rgba(248,111,143,0.10)",
            bubbleColors: [
                "rgba(255,255,255,0.22)",
                "rgba(248,111,143,0.10)",
                "rgba(255,255,255,0.14)",
                "rgba(255,208,219,0.16)",
            ],
            iconButtonColor: colors.danger,
            phaseIcon: "water-outline",
            scenePillColor: colors.danger,
            titleColor: "#B24662",
            messageColor: "#7A4957",
            supportColor: "#9B6B79",
            dayBadgeBackground: "rgba(219,79,102,0.08)",
            dayBadgeBorder: "rgba(219,79,102,0.12)",
            dayBadgeColor: "#B97084",
            statIconColor: colors.danger,
            statLabelColor: "#9B6B79",
            dividerColor: "rgba(219,79,102,0.12)",
            buttonBorder: "rgba(219,79,102,0.32)",
            buttonTextColor: colors.danger,
            weekPalette: {
                weekdayColor: "#9B6B79",
                todayWeekdayColor: "#7A4957",
                dayTextColor: colors.ink,
                todayBackgroundColor: colors.danger,
                todayDayTextColor: colors.surface,
            },
        };
    }

    if (phase === "follicular") {
        return {
            ...baseTheme,
            phaseIcon: "sprout-outline",
        };
    }

    if (phase === "fertile") {
        return {
            ...baseTheme,
            background: colors.fertileSoft,
            glow: "rgba(61,190,134,0.10)",
            bubbleColors: [
                "rgba(255,255,255,0.22)",
                "rgba(61,190,134,0.10)",
                "rgba(255,255,255,0.14)",
                "rgba(203,239,224,0.18)",
            ],
            iconButtonColor: colors.success,
            phaseIcon: "leaf",
            scenePillColor: colors.success,
            titleColor: "#2E8A62",
            messageColor: "#3D6F5F",
            supportColor: "#6D8E83",
            dayBadgeBackground: "rgba(61,190,134,0.08)",
            dayBadgeBorder: "rgba(61,190,134,0.12)",
            dayBadgeColor: "#72A791",
            statIconColor: colors.success,
            statLabelColor: "#6D8E83",
            dividerColor: "rgba(61,190,134,0.12)",
            buttonBorder: "rgba(61,190,134,0.32)",
            buttonTextColor: colors.success,
            weekPalette: {
                weekdayColor: "#6D8E83",
                todayWeekdayColor: "#3D6F5F",
                dayTextColor: colors.ink,
                todayBackgroundColor: colors.success,
                todayDayTextColor: colors.surface,
            },
        };
    }

    return baseTheme;
}
