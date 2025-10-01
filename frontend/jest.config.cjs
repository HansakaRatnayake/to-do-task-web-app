const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.(ts|tsx|js|jsx)$": "ts-jest", // transform ts/js files
    },
    transformIgnorePatterns: [
        "/node_modules/(?!(lucide-react)/)" // ✅ allow lucide-react to be transformed
    ],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts","<rootDir>/jest.setup.ts"],
    testMatch: [
        "<rootDir>/src/**/__tests__/**/*.{ts,tsx,js,jsx}",
        "<rootDir>/src/**/*.{spec,test}.{ts,tsx,js,jsx}"
    ],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1" // optional, helps with absolute imports
    }
};

