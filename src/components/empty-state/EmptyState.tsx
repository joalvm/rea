import type { LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button/PrimaryButton";
import { useTheme } from "@/theme/useTheme";

import { useEmptyStateStyles } from "./EmptyStateStyle";

type Props = {
    Icon: LucideIcon;
    title: string;
    description: string;
    action?: { label: string; onPress: () => void; testID?: string };
    testID?: string;
};

/** Estado vacío de primera vez. Explica qué falta y ofrece una sola acción de salida cuando corresponde. */
export function EmptyState({ Icon, title, description, action, testID }: Props) {
    const theme = useTheme();
    const styles = useEmptyStateStyles();

    return (
        <View accessibilityRole="summary" style={styles.container} testID={testID}>
            <View style={styles.iconBubble}>
                <Icon color={theme.colors.link} size={theme.sizing.iconLg} strokeWidth={2} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            {action ? <PrimaryButton label={action.label} onPress={action.onPress} testID={action.testID} /> : null}
        </View>
    );
}
