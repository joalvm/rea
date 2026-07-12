import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCheckinScreenStyles } from "./CheckinScreenStyle";

type Props = {
    children: ReactNode;
};

/**
 * Lienzo común del wizard de check-in. Solo es un contenedor: SafeAreaView +
 * ScrollView con el fondo de superficie. No pinta botones ni footer; cada paso
 * decide qué CTA necesita y lo coloca dentro usando el estilo `footer` del
 * `useCheckinScreenStyles()`. Sin navegación "atrás" propia: la resuelve el
 * gesto/botón del dispositivo (stack de expo-router).
 */
export function CheckinScreen({ children }: Props) {
    const styles = useCheckinScreenStyles();

    return (
        <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
            <ScrollView contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
                {children}
            </ScrollView>
        </SafeAreaView>
    );
}
