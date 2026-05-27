import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { colors, radii, shadow } from "../theme";

interface SoftCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SoftCard({ children, style }: SoftCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(8, 124, 155, 0.08)",
    padding: 18,
    ...shadow
  }
});
