import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { colors } from "../../../theme";
import styles from "../PatternsScreen.styles";
import { InsightRowProps } from "../patterns.types";

/** Renderiza un insight detectado en el historial reciente. */
export default function InsightRow({ insight }: InsightRowProps) {
    return (
        <View style={styles.insightRow}>
            <View style={[styles.insightIcon, insight.tone === "watch" && styles.insightIconWatch]}>
                <MaterialCommunityIcons
                    color={insight.tone === "watch" ? colors.period : colors.primaryDeep}
                    name={insight.tone === "watch" ? "bell-alert-outline" : "star-four-points-outline"}
                    size={18}
                />
            </View>
            <View style={styles.insightCopy}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightText}>{insight.detail}</Text>
            </View>
        </View>
    );
}
