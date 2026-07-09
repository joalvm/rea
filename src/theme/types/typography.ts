import { Platform, TextStyle } from "react-native";

export type TypographyVariant = {
    display: TextStyle;
    h1: TextStyle;
    h2: TextStyle;
    h3: TextStyle;
    title: TextStyle;
    body: TextStyle;
    bodyStrong: TextStyle;
    callout: TextStyle;
    subhead: TextStyle;
    footnote: TextStyle;
    caption: TextStyle;
    overline: TextStyle;
};

export type FontFamilies = {
    heading: ReturnType<typeof Platform.select<string>>;
    sans: ReturnType<typeof Platform.select<string>>;
    mono: ReturnType<typeof Platform.select<string>>;
};

export type FontSize = {
    display: number;
    h1: number;
    h2: number;
    h3: number;
    title: number;
    body: number;
    callout: number;
    subhead: number;
    footnote: number;
    caption: number;
    overline: number;
};

export type FontWeights = {
    regular: TextStyle["fontWeight"];
    medium: TextStyle["fontWeight"];
    semibold: TextStyle["fontWeight"];
    bold: TextStyle["fontWeight"];
};

export type Typography = {
    families: FontFamilies;
    weights: FontWeights;
    sizes: FontSize;
    variant: TypographyVariant;
};
