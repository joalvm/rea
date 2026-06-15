const path = require("node:path");
const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@assets": path.resolve(__dirname, "assets"),
            "@test": path.resolve(__dirname, "test"),
        },
    },
});
