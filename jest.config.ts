/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import { Config } from "jest";

// Jest configuration for Vite
const config: Config = {
    silent: false,
    verbose: true,
    testEnvironment: "jest-environment-jsdom",
    moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    testPathIgnorePatterns: ["/node_modules/"],
    testRegex: ".*.(test|spec).(j|t)s[x]?$",
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": [
            "esbuild-jest", // Use esbuild for transforming JS/TS files (for Vite)
            {
                sourcemap: true,
            },
        ],
    },
};

// Export Jest config
export default config;
