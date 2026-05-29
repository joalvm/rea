import { View, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import styles from "../TodayScreen.styles";

interface HeroCurveProps {
    backgroundColor: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function HeroCurve({ backgroundColor }: HeroCurveProps) {
    return (
        <View pointerEvents="none" style={styles.heroCurveContainer}>
            <Svg
                width={SCREEN_WIDTH}
                height={60} // Altura de la zona de la curva
                viewBox={`0 0 ${SCREEN_WIDTH} 60`}
            >
                <Path
                    d={`M 0 0
                        H ${SCREEN_WIDTH}
                        V 20
                        Q ${SCREEN_WIDTH / 2} 60 0 20
                        Z`}
                    fill={backgroundColor} // Se pinta con el color de la fase actual
                />
            </Svg>
        </View>
    );
}
