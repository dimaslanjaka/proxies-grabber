// ESLint Flat Config for JS, TS, React, and Prettier
// ---------------------------------------------------
// This configuration uses Flat Config (`eslint.config.js`)
// and integrates:
//   - Base JS rules (@eslint/js)
//   - Babel parser for modern JS & JSX
//   - TypeScript parser for TS/TSX
//   - React + React Hooks plugins
//   - Prettier as an ESLint plugin
//   - jsonc-parser for Prettier config (supports comments)
// Requirements:
//   yarn add -D \
// eslint @eslint/js eslint-config-prettier eslint-plugin-prettier \
// @babel/core @babel/eslint-parser @babel/preset-react @babel/plugin-syntax-import-assertions \
// typescript typescript-eslint \
// eslint-plugin-react eslint-plugin-react-hooks \
// globals jsonc-parser
// ---------------------------------------------------

import babelParser from '@babel/eslint-parser';
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { parse as parseJSONC } from 'jsonc-parser';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prettierrc = parseJSONC(fs.readFileSync(path.resolve(__dirname, '.prettierrc.json'), 'utf-8'));

export default tseslint.config(
  // ---------------------------------------------------
  // 🌍 Global config (applies to all files)
  // ---------------------------------------------------
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: [
      '**/*.md', // Ignore Markdown files
      '**/*.html', // Ignore raw HTML files
      '**/*.py', // Ignore Python scripts
      '**/*.txt', // Ignore plain text
      '**/tmp/**', // Ignore temp files
      '**/app/**', // Ignore custom app output
      '**/dist/**', // Ignore build output
      '**/node_modules/**', // Ignore dependencies
      '**/coverage/**', // Ignore test coverage
      '**/logs/**', // Ignore logs
      '**/vendor/**', // Ignore vendor code
      '**/min.*', // Ignore minified assets
      '**/*.lock', // Ignore lockfiles
      '**/public/**', // Ignore public assets
      '**/.yarn/**' // Ignore Yarn cache
    ],

    // Global language options
    languageOptions: {
      globals: {
        // Browser globals (window, document, etc.)
        ...globals.browser,
        // Node.js globals (process, __dirname, etc.)
        ...globals.node,
        // Jest testing globals
        ...globals.jest,
        // Google reCAPTCHA
        grecaptcha: 'readonly',
        // jQuery $
        $: 'readonly',
        // jQuery object
        jQuery: 'readonly',
        // Google Ads
        adsbygoogle: 'writable',
        // Hexo static site generator
        hexo: 'readonly'
      },
      // Support latest ECMAScript syntax
      ecmaVersion: 'latest',
      // Enable ES modules
      sourceType: 'module'
    },

    plugins: { prettier },

    rules: {
      // ✅ Run Prettier as an ESLint rule (using config with comments)
      'prettier/prettier': ['error', prettierrc],

      // ✅ Disable stylistic rules that conflict with Prettier
      ...prettierConfig.rules,

      // Example JS style relaxations
      'arrow-body-style': 'off', // Allow any arrow fn body style
      'prefer-arrow-callback': 'off', // Allow normal function callbacks
      // ⚙️ Allow unused variables starting with "_"
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  },

  // ---------------------------------------------------
  // 📜 ESM (JS, MJS, JSX)
  // ---------------------------------------------------
  {
    files: ['**/*.{js,mjs,jsx}'],
    languageOptions: {
      // Use Babel parser for modern JS/JSX
      parser: babelParser,
      parserOptions: {
        // Allow parsing without .babelrc
        requireConfigFile: false,
        babelOptions: {
          // Handle JSX in JS files
          presets: ['@babel/preset-react'],
          // Support `import ... with { type: "json" }`
          plugins: ['@babel/plugin-syntax-import-assertions']
        },
        ecmaFeatures: {
          // Enable JSX parsing
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      // Only use base no-unused-vars for JS, allow unused vars starting with _
      '@typescript-eslint/no-unused-vars': 'off',
      // Place custom no-unused-vars last to ensure it takes precedence
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  },

  // ---------------------------------------------------
  // 📦 CommonJS (CJS)
  // ---------------------------------------------------
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      parser: babelParser,
      parserOptions: {
        // Allow parsing without .babelrc
        requireConfigFile: false,
        babelOptions: {
          // Handle JSX in JS files
          presets: ['@babel/preset-env']
        }
      },
      globals: {
        ...globals.node
      }
    },
    rules: {
      // Allow require statements in CJS files
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-var-requires': 'off', // Allow require() in CJS
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  },

  // ---------------------------------------------------
  // 🟦 TypeScript (TS, TSX, MTS, CTS)
  // ---------------------------------------------------
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      // TypeScript-aware parser
      parser: tseslint.parser,
      parserOptions: {
        // Point to project tsconfig
        project: './tsconfig.json'
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      // Replace base "no-unused-vars" with TS version
      'no-unused-vars': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off', // No need to force return types
      '@typescript-eslint/no-explicit-any': 'off', // Allow `any`
      '@typescript-eslint/no-this-alias': [
        'error',
        {
          allowDestructuring: false,
          allowedNames: ['self', 'hexo'] // Allow aliasing `this` to self/hexo
        }
      ],
      // Place custom TS unused-vars rule last to ensure it takes precedence
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_', // Allow ignored args starting with "_"
          varsIgnorePattern: '^_', // Allow ignored vars starting with "_"
          caughtErrorsIgnorePattern: '^_' // Allow ignored caught errors
        }
      ]
    }
  },

  // ---------------------------------------------------
  // ⚛️ React (JSX + TSX)
  // ---------------------------------------------------
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react, // React linting rules
      'react-hooks': reactHooks, // Enforce hooks rules
      prettier
    },
    rules: {
      // ✅ React recommended rules
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,

      // ✅ React Hooks best practices
      ...reactHooks.configs.recommended.rules,

      // ✅ Prettier formatting
      'prettier/prettier': 'error',

      // ⚙️ Adjustments for modern React
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off' // Disable PropTypes if using TS
    },
    settings: {
      react: {
        version: 'detect' // Auto-detect installed React version
      }
    }
  }
);
