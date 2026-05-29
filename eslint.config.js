const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const globals = require("globals");

module.exports = defineConfig([
    globalIgnores([".expo/*", "dist/*"]),
    expoConfig,
    eslintPluginPrettierRecommended,
    {
        settings: {
            "import/resolver": {
                typescript: {
                    project: "./tsconfig.json",
                },
            },
        },
    },
    {
        files: ["*.config.js", "scripts/**/*.js", "scripts/**/*.cjs"],
        languageOptions: {
            globals: globals.node,
        },
    },
]);
