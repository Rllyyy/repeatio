/** @type {import('ts-jest').JestConfigWithTsJest} */
/* https://github.com/muratkeremozcan/tour-of-heroes-react-vite-cypress-ts/blob/1a2b637517ad94a7d6975cbb7ef409e94be57936/jest.config.js */

module.exports = {
  // A preset that is used as a base for Jest's configuration
  preset: "ts-jest",

  // The test environment that will be used for testing
  testEnvironment: "jsdom",

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Use moduleNameMapper to mock CSS and LESS imports during Jest tests with "identity-obj-proxy".
  moduleNameMapper: {
    "\\.(css|less)$": "identity-obj-proxy",
  },

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ["/node_modules/", "/cypress"],

  // Indicates whether each individual test should be reported during the run
  verbose: true,
};
