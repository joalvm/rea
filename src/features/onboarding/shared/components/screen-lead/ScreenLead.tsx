import { Text } from "react-native";

import { useScreenLeadStyles } from "./ScreenLeadStyle";

type Props = {
    children: string;
    center?: boolean;
};

export function ScreenLead({ children, center }: Props) {
    const styles = useScreenLeadStyles();

    return <Text style={[styles.lead, center && styles.center]}>{children}</Text>;
}
