import { Pressable, ScrollView, Text, View } from "react-native";

import { useSettingsStyles } from "./SettingsStyle";

type SettingsLink = {
    label: string;
    onPress: () => void;
    hint?: string;
    testID?: string;
};

type Props = {
    links: SettingsLink[];
};

/** Tab Configuración: índice que abre cada pantalla de ajustes. Ver README de la feature. */
export default function SettingsScreen({ links }: Props) {
    const styles = useSettingsStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Configuración"}</Text>
            <Text style={styles.description}>{"Índice de ajustes. Cada opción abre su pantalla."}</Text>

            <View style={styles.links}>
                {links.map((link) => (
                    <Pressable
                        key={link.label}
                        testID={link.testID}
                        style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
                        onPress={link.onPress}
                    >
                        <Text style={styles.linkLabel}>{link.label}</Text>
                        {link.hint ? <Text style={styles.linkHint}>{link.hint}</Text> : null}
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );
}
