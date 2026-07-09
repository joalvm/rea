import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { useTheme } from "@/theme/useTheme";

import { useReaIllustrationStyles } from "./ReaIllustrationStyle";

type Props = {
    variant?: "welcome" | "complete";
    size?: number;
    accent?: string;
};

// Constantes de ilustración (identidad de marca, semi-agnósticas al tema):
// cabello violeta = identidad constante de la protagonista; piel cálida.
const HAIR = "#3B2E4A";
const HAIR_SHADOW = "#2E2438";
const HAIR_HI = "#52415F";
const SKIN = "#F4C9A8";
const SKIN_SHADOW = "#E3B190";

/**
 * Ilustración de bisagra (bienvenida / cierre): protagonista faceless de medio
 * cuerpo sobre un blob de luz celeste, con un orbe = "la luz de Rea". Plana,
 * suave, sin rostro (brand-safe). Las pantallas de captura usan `StepBadge`.
 */
export function ReaIllustration({ variant = "welcome", size = 206, accent }: Props) {
    const theme = useTheme();
    const styles = useReaIllustrationStyles();
    const body = accent ?? (variant === "complete" ? theme.colors.primaryPressed : theme.colors.primary);
    const orbSize = Math.round(size * 0.26);
    const orbStyle = {
        width: orbSize,
        height: orbSize,
        borderRadius: orbSize / 2,
        top: size * 0.12,
        ...(variant === "complete" ? { left: size * 0.1 } : { right: size * 0.12 }),
    };

    return (
        <View style={[styles.wrap, { width: size, height: size }]}>
            <View style={[styles.blob, { width: size, height: size, borderRadius: size / 2 }]}>
                <Svg width={size} height={size} viewBox="0 0 200 200">
                    {/* cabello (atrás): melena larga que enmarca y cae tras los hombros */}
                    <Path
                        d="M60 64 C60 36 78 26 100 26 C122 26 140 36 140 64 C149 104 151 150 146 182 C133 176 121 178 113 184 C109 160 106 150 100 150 C94 150 91 160 87 184 C79 178 67 176 54 182 C49 150 51 104 60 64 Z"
                        fill={HAIR}
                    />
                    {/* sombra de la melena (lado derecho) para volumen */}
                    <Path
                        d="M134 66 C146 106 148 150 142 182 C147 150 150 104 140 66 Z"
                        fill={HAIR_SHADOW}
                        opacity={0.6}
                    />
                    {/* torso / vestido en A */}
                    <Path d="M50 200 C50 152 74 114 100 114 C126 114 150 152 150 200 Z" fill={body} />
                    {/* cuello (corto) */}
                    <Path d="M93 97 L107 97 L109 114 L91 114 Z" fill={SKIN} />
                    {/* sombra bajo el mentón */}
                    <Path d="M93 97 L107 97 L107 103 C104 107 96 107 93 103 Z" fill={SKIN_SHADOW} opacity={0.7} />
                    {/* cabeza */}
                    <Circle cx={100} cy={72} r={27} fill={SKIN} />
                    {/* mechón lateral izquierdo enmarcando el rostro */}
                    <Path d="M73 66 C67 90 70 110 81 122 C76 110 74 90 77 70 Z" fill={HAIR} />
                    {/* mechón lateral derecho */}
                    <Path d="M127 66 C133 90 130 110 119 122 C124 110 126 90 123 70 Z" fill={HAIR} />
                    {/* flequillo / coronilla */}
                    <Path
                        d="M72 74 C71 46 84 38 100 38 C116 38 129 46 128 74 C127 60 115 54 100 54 C85 54 73 60 72 74 Z"
                        fill={HAIR}
                    />
                    {/* brillo del cabello */}
                    <Path d="M85 44 C92 39 105 39 112 44 C105 48 92 48 85 44 Z" fill={HAIR_HI} opacity={0.55} />
                    {variant === "complete" ? (
                        <>
                            {/* brazos en alto celebrando, naciendo de los hombros + manos redondas */}
                            <Path
                                d="M82 120 C64 116 50 104 56 91"
                                stroke={SKIN}
                                strokeWidth={11}
                                fill="none"
                                strokeLinecap="round"
                            />
                            <Path
                                d="M118 120 C136 116 150 104 144 91"
                                stroke={SKIN}
                                strokeWidth={11}
                                fill="none"
                                strokeLinecap="round"
                            />
                            <Circle cx={56} cy={89} r={7} fill={SKIN} />
                            <Circle cx={144} cy={89} r={7} fill={SKIN} />
                        </>
                    ) : null}
                </Svg>
            </View>

            <View style={[styles.orb, orbStyle]} />
            {variant === "complete" ? (
                <>
                    <View style={[styles.spark, styles.spark1]} />
                    <View style={[styles.spark, styles.spark2, { backgroundColor: theme.colors.warning }]} />
                    <View style={[styles.spark, styles.spark3, { backgroundColor: theme.colors.danger }]} />
                </>
            ) : null}
        </View>
    );
}
