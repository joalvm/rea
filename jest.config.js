const expoJestPreset = require("jest-expo/jest-preset");

module.exports = {
    ...expoJestPreset,
    moduleNameMapper: {
        "^@test/db/(.*)$": "<rootDir>/test/unit/db/$1",
        "^@test/(.*)$": "<rootDir>/test/$1",
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@assets/(.*)$": "<rootDir>/assets/$1",
        ...(expoJestPreset.moduleNameMapper ?? {}),
    },
    testMatch: ["<rootDir>/test/**/*.test.ts", "<rootDir>/test/**/*.test.tsx"],
    modulePathIgnorePatterns: ["<rootDir>/__legacy__/"],
    testPathIgnorePatterns: ["/node_modules/", "/__legacy__/"],
};
