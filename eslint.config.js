import js from '@eslint/js';
import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import { configs, plugins } from 'eslint-config-airbnb-extended';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import vitest from '@vitest/eslint-plugin';
import reactRefresh from 'eslint-plugin-react-refresh';
import tanStackPluginQuery from '@tanstack/eslint-plugin-query';
import reactRedux from 'eslint-plugin-react-redux';

export const projectRoot = path.resolve('.');
export const gitignorePath = path.resolve(projectRoot, '.gitignore');

const jsConfig = [
  // ESLint Recommended Rules
  js.configs.recommended,
  // Stylistic Plugin
  plugins.stylistic,
  // Import X Plugin
  plugins.importX,
  // Airbnb Base Recommended Config
  ...configs.base.recommended,
];

const reactConfig = [
  // React Plugin
  plugins.react,
  // React Hooks Plugin
  plugins.reactHooks,
  // React JSX A11y Plugin
  plugins.reactA11y,
  // Airbnb React Recommended Config
  ...configs.react.recommended,
  {
    plugins: {
      'react-refresh': reactRefresh,
    },

    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-curly-brace-presence': 'error',
      // React Refresh rules for better HMR
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
];

const reduxConfig = [
  {
    plugins: {
      'react-redux': reactRedux,
    },
    rules: reactRedux.configs.recommended.rules,
  },
  {
    files: ['src/**/*Slice.ts'],
    rules: { 'no-param-reassign': ['error', { props: false }] },
  },
];

const typescriptConfig = [
  // TypeScript ESLint Plugin
  plugins.typescriptEslint,
  // Airbnb Base TypeScript Config
  ...configs.base.typescript,
  // Airbnb React TypeScript Config
  ...configs.react.typescript,
];

const vitestConfig = [
  {
    files: ['**/*.test.*', '**/*.spec.*', './vitest-setup.ts', './src/test-util/**/*.tsx', './src/test-util/**/*.ts'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
      // Additional Vitest-specific rules
      'vitest/prefer-to-be': 'error',
      'vitest/prefer-to-have-length': 'error',
      'vitest/prefer-strict-equal': 'error',
    },
  },
];

export default [
  // Ignore .gitignore files/folder in eslint
  includeIgnoreFile(gitignorePath),
  {
    ignores: ['src/__snapshots__', 'src/client', 'dist/**/*', 'coverage/**/*'],
  },
  // Javascript Config
  ...jsConfig,
  // React Config
  ...reactConfig,
  // TypeScript Config
  ...typescriptConfig,
  // Redux config
  ...reduxConfig,
  // Testing Config
  ...vitestConfig,
  // TanStack Query Config
  ...tanStackPluginQuery.configs['flat/recommended'],
  // Prettier Config (should be last to override conflicting rules)
  eslintConfigPrettier,
];
