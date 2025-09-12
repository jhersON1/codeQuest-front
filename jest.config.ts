import type { Config } from "jest"
import nextJest from "next/jest.js"

const createJestConfig = nextJest({
  dir: "./",
})

const config: Config = {
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.polyfills.js", "<rootDir>/.jest/setEnvVars.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(scss|sass|css)$": "identity-obj-proxy",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/out/", "/build/"],
  transformIgnorePatterns: ["/node_modules/"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "jest.config.ts",
    "next.config.ts",
    "/src/config/msw/",
    ".*types\\.ts$",
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
