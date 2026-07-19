// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    collectCoverageFrom: [
        "workspace/src/**/*.js"
    ], 
    coverageDirectory: "report/coverage",
    browser: true,
    resetMocks: true,
    globals: {
        "__VERSION__": "test",
        "__HASH__": "0"
    },
    setupFiles: [
        "<rootDir>/workspace/src/husky_framework/HuskyClass.js",
        "<rootDir>/workspace/src/husky_framework/HuskyEvent.js",
        "<rootDir>/workspace/test/setup/jquery.js"
    ],
    moduleNameMapper: {
        "^@static(.*)$": "<rootDir>/workspace/static$1",
        "^@src(.*)$": "<rootDir>/workspace/src$1",
        "^@test(.*)$": "<rootDir>/workspace/test$1"
    },
    transformIgnorePatterns: [
        "/node_modules/",
        "/lib/"
    ]
};
