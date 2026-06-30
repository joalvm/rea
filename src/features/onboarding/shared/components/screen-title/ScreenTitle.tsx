import { Text } from "react-native";

import { useScreenTitleStyles } from "./ScreenTitleStyle";

type Props = {
    children: string;
    accent?: string;
    center?: boolean;
};

export function ScreenTitle({ children, accent, center }: Props) {
    const styles = useScreenTitleStyles();

    return <Text style={[styles.title, center && styles.center, accent ? { color: accent } : null]}>{children}</Text>;
}
