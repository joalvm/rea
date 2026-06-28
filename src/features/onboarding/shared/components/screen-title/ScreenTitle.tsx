import { Text } from "react-native";

import { useScreenTitleStyles } from "./ScreenTitleStyle";

type Props = {
    children: string;
    accent?: string;
};

export function ScreenTitle({ children, accent }: Props) {
    const styles = useScreenTitleStyles();

    return <Text style={[styles.title, accent ? { color: accent } : null]}>{children}</Text>;
}
