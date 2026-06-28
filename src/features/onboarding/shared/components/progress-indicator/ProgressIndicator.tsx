import { View } from "react-native";

import { useTheme } from "@/theme/useTheme";

import { useProgressIndicatorStyles } from "./ProgressIndicatorStyle";

type Props = {
    progress: number;
    accent?: string;
};

export function ProgressIndicator({ progress, accent }: Props) {
    const theme = useTheme();
    const styles = useProgressIndicatorStyles();
    const pct = `${Math.max(0, Math.min(1, progress)) * 100}%` as `${number}%`;

    return (
        <View style={styles.track}>
            <View style={[styles.fill, { width: pct, backgroundColor: accent ?? theme.colors.primaryPressed }]} />
        </View>
    );
}
