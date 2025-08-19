import { defaults } from 'jest-config';
import path from 'upath';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('jest').Config} */
export default {
  ...defaults,
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    // TypeScript files
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        babelConfig: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: { node: 'current' }
              }
            ],
            '@babel/preset-typescript'
          ]
        },
        useESM: true,
        tsconfig: path.join(__dirname, 'tsconfig.jest.json')
      }
    ],
    // ESM JavaScript files
    '^.+\\.(mjs)$': [
      'babel-jest',
      {
        presets: [['@babel/preset-env', { targets: { node: 'current' }, modules: false }]],
        babelrc: false,
        configFile: false
      }
    ],
    // CommonJS and other JS files
    '^.+\\.(cjs|js|jsx)$': [
      'babel-jest',
      {
        presets: [['@babel/preset-env', { targets: { node: 'current' } }]]
      }
    ]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json', 'node'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.(js|mjs|jsx|tsx)$': '$1'
  },
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js|jsx|mjs|cjs)', '**/*.(test|spec).+(ts|tsx|js|jsx|mjs|cjs)'],
  transformIgnorePatterns: ['/node_modules/(?!your-esm-package)/'], // allow ESM packages if needed
  collectCoverageFrom: ['src/**/*.{ts,js,mjs,cjs}'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/tmp/', '/test/', '/__tests__/', '/coverage/', '/lib/'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: [],
  testTimeout: 120000,
  detectOpenHandles: true,
  modulePathIgnorePatterns: ['<rootDir>/test/package.json']
};
