import { Text } from "react-native";

import { useScreenLeadStyles } from "./ScreenLeadStyle";

type Props = {
    children: string;
};

export function ScreenLead({ children }: Props) {
    const styles = useScreenLeadStyles();

    return <Text style={styles.lead}>{children}</Text>;
}
