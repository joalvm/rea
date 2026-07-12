import { Heart, Info } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Alert, Modal, Pressable, Text, View } from "react-native";

import { useTheme } from "@/theme/useTheme";
import { usePositiveTestCardStyles } from "./PositiveTestCardStyle";

type Props = {
    visible: boolean;
    /** Cierra la tarjeta y completa el flujo de check-in (vuelve al origen). */
    onDismiss: () => void;
};

/**
 * Tarjeta post-guardado de test de embarazo positivo. Tono neutro y cuidadoso:
 * sin celebración ni drama. Para quien evita un embarazo, un positivo puede no
 * ser una buena noticia. Informa del resultado y ofrece dos salidas:
 *  - "Activar modo embarazo": puente del plan 10 (no implementado aún → Alert
 *    informativo de marcador, deja el hook listo).
 *  - "Seguir como estoy": cierra y vuelve al flujo normal.
 *
 * La tarjeta NO interpreta el test ni concluye nada clínico; solo informa y
 * ofrece una acción opcional.
 */
export function PositiveTestCard({ visible, onDismiss }: Props) {
    const { t } = useTranslation("checkIn");
    const { t: tCommon } = useTranslation("common");
    const theme = useTheme();
    const styles = usePositiveTestCardStyles();

    const handleActivate = () => {
        // Plan 10 (modo embarazo) no existe aún. Stub del puente: informa y
        // deja el hook ready para cuando el flujo real esté disponible.
        Alert.alert(t("testPositive.title"), tCommon("feedback.comingSoon"), [
            { text: tCommon("action.ok"), onPress: onDismiss },
        ]);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.iconBubble}>
                        <Heart size={theme.sizing.iconLg} color={theme.colors.textSecondary} strokeWidth={2.2} />
                    </View>
                    <Text style={styles.title}>{t("testPositive.title")}</Text>
                    <Text style={styles.lead}>{t("testPositive.lead")}</Text>
                    <Text style={styles.hint}>{t("testPositive.hint")}</Text>
                    <Pressable style={[styles.cta, styles.ctaPrimary]} onPress={handleActivate}>
                        <Text style={styles.ctaPrimaryText}>{t("testPositive.activatePregnancy")}</Text>
                    </Pressable>
                    <Pressable style={[styles.cta, styles.ctaSecondary]} onPress={onDismiss}>
                        <Text style={styles.ctaSecondaryText}>{t("testPositive.stayAsIs")}</Text>
                    </Pressable>
                    <View style={styles.disclaimer}>
                        <Info size={theme.sizing.iconSm} color={theme.colors.textMuted} strokeWidth={2} />
                        <Text style={styles.disclaimerText}>{t("testPositive.hint")}</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
