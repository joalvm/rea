import { Text } from "react-native";

import { useFieldLabelStyles } from "./FieldLabelStyle";

type Props = {
    children: string;
};

export function FieldLabel({ children }: Props) {
    const styles = useFieldLabelStyles();

    return <Text style={styles.label}>{children}</Text>;
}
