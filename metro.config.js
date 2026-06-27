// Configuración de Metro: habilita importar `*.svg` como componentes React Native
// vía `react-native-svg-transformer`. El onboarding usa los assets de
// `assets/images/onboarding/*.svg` como ilustraciones nítidas y theme-agnósticas.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer/expo");
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

module.exports = config;
