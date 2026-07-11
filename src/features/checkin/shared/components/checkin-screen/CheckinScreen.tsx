import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button/PrimaryButton";

import { useCheckinScreenStyles } from "./CheckinScreenStyle";

export type CheckinCta = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    accent?: string;
    Icon?: LucideIcon;
};

type Props = {
    /** Paso actual (1-based) y total, para los puntos tipo carrusel sobre el CTA. */
    step?: number;
    total?: number;
    accent?: string;
    /** CTA principal del paso (Continuar / Guardar). */
    cta?: CheckinCta;
    /** CTA secundario (Cancelar / Saltar). */
    secondaryCta?: CheckinCta;
    /** CTA "Guardar" persistente del wizard: visible desde cualquier paso. */
    saveCta?: CheckinCta;
    /** Pie totalmente personalizado (anula cta/secondaryCta/saveCta). */
    footer?: ReactNode;
    center?: boolean;
    children: ReactNode;
};

/**
 * Lienzo común del wizard de check-in. Sin botón de "atrás" propio: la
 * navegación hacia atrás la resuelve el gesto/botón del dispositivo (stack de
 * expo-router). El CTA "Guardar" del wizard vive en el pie y está disponible
 * desde cualquier paso (cumple "Guardar accesible desde cualquier paso").
 */
export function CheckinScreen({ cta, secondaryCta, saveCta, footer, center, children }: Props) {
    const styles = useCheckinScreenStyles();

    return (
        <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
            <View style={styles.topSpacer} />

            <ScrollView
                contentContainerStyle={[styles.bodyContent, center && styles.bodyCenter]}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>

            <View style={styles.footer}>
                {footer ?? (
                    <>
                        {cta ? (
                            <PrimaryButton
                                label={cta.label}
                                onPress={cta.onPress}
                                disabled={cta.disabled}
                                accent={cta.accent}
                                Icon={cta.Icon}
                            />
                        ) : null}
                        {secondaryCta ? (
                            <PrimaryButton
                                label={secondaryCta.label}
                                onPress={secondaryCta.onPress}
                                disabled={secondaryCta.disabled}
                                variant="secondary"
                            />
                        ) : null}
                        {saveCta ? (
                            <PrimaryButton
                                label={saveCta.label}
                                onPress={saveCta.onPress}
                                disabled={saveCta.disabled}
                                variant="ghost"
                                Icon={saveCta.Icon}
                            />
                        ) : null}
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}
