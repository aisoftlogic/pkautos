/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        diagnostics: false,
        isolatedModules: false
      }
    ]
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',
  collectCoverage: false,
  globals: {},
  // Enable experimental decorators via ts-jest using the TS compiler options already present
  setupFilesAfterEnv: [],
};
