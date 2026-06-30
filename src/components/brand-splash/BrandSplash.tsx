import { StyleSheet, View } from "react-native";

import LogoMark from "@assets/images/branding/logo-mark.svg";
import { aqua, mist } from "@/theme/tokens/colors";

const MARK_WIDTH = 104;
const MARK_RATIO = 1004 / 577; // viewBox del logo-mark (alto/ancho)

/**
 * Pantalla de arranque de marca: fondo celeste primario a pantalla completa con
 * la marca de Rea (`logo-mark`) centrada en blanco. Patrón de launch screen
 * (fondo sólido + símbolo al centro). Cubre el gate de boot (mientras se decide
 * onboarding vs. app principal) y da continuidad visual con el splash nativo,
 * que comparte el mismo celeste `#7CD9F9`.
 */
export function BrandSplash() {
    return (
        <View style={styles.screen}>
            <LogoMark width={MARK_WIDTH} height={MARK_WIDTH * MARK_RATIO} color={mist[0]} />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: aqua[300],
    },
});
