import type { LucideIcon } from "lucide-react-native";
import { Info } from "lucide-react-native";
import { Text, View } from "react-native";

import { useTheme } from "@/theme/useTheme";

import { useInlineNoticeStyles } from "./InlineNoticeStyle";

type Tone = "info" | "success" | "warning" | "danger";

type Props = {
    title?: string;
    children: string;
    Icon?: LucideIcon;
    tone?: Tone;
    testID?: string;
};

/** Feedback contextual no bloqueante. Para decisiones irreversibles usa diálogo nativo, no este componente. */
export function InlineNotice({ title, children, Icon = Info, tone = "info", testID }: Props) {
    const theme = useTheme();
    const styles = useInlineNoticeStyles();
    const palette = getPalette(theme, tone);

    return (
        <View
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={[styles.notice, { backgroundColor: palette.surface }]}
            testID={testID}
        >
            <Icon color={palette.accent} size={theme.sizing.iconSm} strokeWidth={2.3} />
            <View style={styles.copy}>
                {title ? <Text style={[styles.title, { color: palette.text }]}>{title}</Text> : null}
                <Text style={[styles.body, { color: palette.text }]}>{children}</Text>
            </View>
        </View>
    );
}

function getPalette(theme: ReturnType<typeof useTheme>, tone: Tone) {
    if (tone === "success") {
        return { accent: theme.colors.success, surface: theme.colors.successSurface, text: theme.colors.successText };
    }

    if (tone === "warning") {
        return { accent: theme.colors.warning, surface: theme.colors.warningSurface, text: theme.colors.warningText };
    }

    if (tone === "danger") {
        return { accent: theme.colors.danger, surface: theme.colors.dangerSurface, text: theme.colors.dangerText };
    }

    return { accent: theme.colors.link, surface: theme.colors.primarySubtle, text: theme.colors.text };
}
