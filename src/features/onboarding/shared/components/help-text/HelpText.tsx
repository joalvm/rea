import { Text } from "react-native";

import { useHelpTextStyles } from "./HelpTextStyle";

type Props = {
    children: string;
};

export function HelpText({ children }: Props) {
    const styles = useHelpTextStyles();

    return <Text style={styles.help}>{children}</Text>;
}
