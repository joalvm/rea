const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const eslintPluginUnusedImports = require("eslint-plugin-unused-imports");
const globals = require("globals");

module.exports = defineConfig([
    globalIgnores([".expo/*", "dist/*", "__legacy__/*"]),
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
        plugins: {
            "unused-imports": eslintPluginUnusedImports,
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "warn",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
        },
    },
    {
        files: ["*.config.js", "scripts/**/*.js", "scripts/**/*.cjs"],
        languageOptions: {
            globals: globals.node,
        },
    },
]);
