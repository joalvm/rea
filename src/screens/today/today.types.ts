/** Paleta visual aplicada al hero editorial de la pantalla Hoy. */
export interface TodayHeroTheme {
    background: string;
    glow: string;
    bubbleColors: string[];
    iconButtonColor: string;
    iconButtonBackground: string;
    phaseIcon: string;
    scenePillColor: string;
    titleColor: string;
    messageColor: string;
    supportColor: string;
    dayBadgeBackground: string;
    dayBadgeBorder: string;
    dayBadgeColor: string;
    statCardBackground: string;
    statCardBorder: string;
    statIconColor: string;
    statLabelColor: string;
    statValueColor: string;
    dividerColor: string;
    buttonBackground: string;
    buttonBorder: string;
    buttonTextColor: string;
    weekPalette: {
        weekdayColor: string;
        todayWeekdayColor: string;
        dayTextColor: string;
        todayBackgroundColor: string;
        todayDayTextColor: string;
    };
}

/** Tono visible para alertas resumidas en Hoy. */
export interface TodayAlertTone {
    label: string;
    background: string;
    ink: string;
}

/** Consejo breve de autocuidado mostrado en Hoy. */
export interface TodayCareTip {
    icon: string;
    text: string;
    color: string;
    background: string;
}
