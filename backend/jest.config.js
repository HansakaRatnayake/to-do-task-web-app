const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  verbose: true,
  forceExit: true,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  transformIgnorePatterns: ["/node_modules/(?!(uuid)/)"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json" // Use separate test tsconfig
    }
  }
};
