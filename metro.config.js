const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve("./scripts/sqlTransformer.js");
config.resolver.sourceExts = [...config.resolver.sourceExts, "sql"];

module.exports = config;
