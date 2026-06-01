export const colors = {
    primary: "#7CD9F9",
    primarySoft: "#EFF9FD",
    primaryDeep: "#087C9B",
    primaryInk: "#05586F",
    background: "#FAFCFB",
    surface: "#FFFFFF",
    surfaceSoft: "#F3F7F6",
    ink: "#1B2C33",
    muted: "#738189",
    line: "rgba(27, 44, 51, 0.08)",
    period: "#F86F8F",
    periodSoft: "#FFE7EE",
    fertile: "#8FDCC3",
    fertileSoft: "#E8F8F2",
    luteal: "#CFC2EB",
    lutealSoft: "#F3EFFA",
    warning: "#F6B544",
    success: "#3DBE86",
    danger: "#DB4F66",
};

export const radii = {
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    pill: 999,
};

export const shadow = {
    shadowColor: "#05586F",
    shadowOpacity: 0.025,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 0,
};

export const elevations = {
    card: {
        shadowColor: colors.primaryInk,
        shadowOpacity: 0.035,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 0,
    },
    lift: {
        shadowColor: colors.primaryInk,
        shadowOpacity: 0.05,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 12 },
        elevation: 0,
    },
};

export const type = {
    family: "System",
    display: 34,
    title: 22,
    subtitle: 17,
    body: 15,
    small: 12,
    tiny: 10,
};

export const weights = {
    medium: "500",
    semibold: "700",
    bold: "800",
    black: "900",
} as const;

export const spacing = {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    hero: 56,
} as const;

export const surfaces = {
    canvas: colors.background,
    card: colors.surface,
    cardSoft: "#F7FBFC",
    cardRaised: "rgba(255,255,255,0.92)",
    cardTinted: "rgba(255,255,255,0.78)",
    border: colors.line,
    borderStrong: "rgba(8,124,155,0.14)",
    borderSoft: "rgba(8,124,155,0.08)",
    tabBar: "rgba(255,255,255,0.94)",
} as const;

export const accents = {
    neutral: {
        tint: "rgba(27,44,51,0.04)",
        border: "rgba(27,44,51,0.08)",
        ink: colors.ink,
        softInk: colors.muted,
    },
    primary: {
        tint: "rgba(124,217,249,0.18)",
        border: "rgba(8,124,155,0.14)",
        ink: colors.primaryInk,
        softInk: colors.primaryDeep,
    },
    period: {
        tint: "rgba(248,111,143,0.12)",
        border: "rgba(219,79,102,0.16)",
        ink: colors.danger,
        softInk: colors.period,
    },
    fertile: {
        tint: "rgba(61,190,134,0.12)",
        border: "rgba(61,190,134,0.18)",
        ink: colors.success,
        softInk: "#2E8A62",
    },
    luteal: {
        tint: "rgba(122,94,201,0.12)",
        border: "rgba(122,94,201,0.18)",
        ink: "#6C59A8",
        softInk: "#5B4C7E",
    },
} as const;

export type AccentToneName = keyof typeof accents;

export const screen = {
    topInset: 58,
    horizontalPadding: 20,
    bottomInset: 32,
    blockGap: 22,
    sectionGap: 12,
    headerGap: 10,
    titleSize: 20,
    titleLineHeight: 34,
    subtitleLineHeight: 23,
    sectionTitleLineHeight: 28,
    kickerTracking: 0.8,
    maxTextWidth: 336,
    buttonMinHeight: 52,
    tabBarTopPadding: 6,
} as const;

export const interactions = {
    pressScale: 0.985,
    pressScaleSoft: 0.992,
    pressScaleStrong: 0.965,
    pressTranslateY: 1,
    pressOpacity: 0.94,
} as const;
