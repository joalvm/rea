import type { ViewStyle } from "react-native";

export type ShadowLevel = 0 | 1 | 2 | 3;

export type ShadowSet = Record<ShadowLevel, ViewStyle>;
