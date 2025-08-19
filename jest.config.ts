import type { Config } from 'jest';
import { defaults } from 'jest-config';
import { join } from 'path';

/**
 * @type {import('jest').Config}
 * @see {@link https://jestjs.io/docs/configuration}
 * * how to run single test {@link https://stackoverflow.com/questions/28725955/how-do-i-test-a-single-file-using-jest}
 */
const config: Config = {
  // preset for typescript
  preset: 'ts-jest',
  // test environtment
  testEnvironment: 'node',
  // extension of modules
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'mts'],
  // jest verbose
  verbose: false,
  // jest use cache
  cache: true,
  // jest cache directory
  cacheDirectory: join(__dirname, 'tmp/jest'),
  // collect coverage from src folder but ignore with negate patterns
  collectCoverageFrom: ['src/*.{js,ts}', '!**/node_modules/**', '!**/vendor/**', '!**/test/**', '!**/*.test.{js,ts}'],
  // test root directory
  roots: [`<rootDir>/tests`],
  // ignore collect coverage from these patterns
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/tmp/', '/test/'],
  // test files with these patterns
  testMatch: [`**/__tests__/**/*.+(ts|tsx|js)`, `**/?(*.)+(spec|test).+(ts|tsx|js)`, `**/test/*.test.ts`],
  // transformer typescript
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      // required due to custom location of tsconfig.json configuration file
      // https://kulshekhar.github.io/ts-jest/docs/getting-started/options/tsconfig
      { tsconfig: './tsconfig.json' }
    ]
  },
  // detect memory leaks
  detectLeaks: true,
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  // collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: undefined,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  // coveragePathIgnorePatterns: [
  //   "\\\\node_modules\\\\"
  // ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8'

  // A list of reporter names that Jest uses when writing coverage reports
  // coverageReporters: [
  //   "json",
  //   "text",
  //   "lcov",
  //   "clover"
  // ],
};

export default config;
