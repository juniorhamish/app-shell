import js from '@eslint/js';
import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import { configs, plugins } from 'eslint-config-airbnb-extended';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import vitest from '@vitest/eslint-plugin';
import pluginJest from 'eslint-plugin-jest';

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
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-curly-brace-presence': 'error',
    },
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
    files: ['**/*.test.*', './vitest-setup.ts', './src/test-util/TranslationsWrapper.tsx'],
    plugins: {
      vitest,
      jest: pluginJest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'import-x/no-extraneous-dependencies': [2, { devDependencies: true }],
    },
  },
];

export default [
  // Ignore .gitignore files/folder in eslint
  includeIgnoreFile(gitignorePath),
  {
    ignores: ['src/__snapshots__'],
  },
  // Javascript Config
  ...jsConfig,
  // React Config
  ...reactConfig,
  // TypeScript Config
  ...typescriptConfig,
  ...vitestConfig,
  eslintConfigPrettier,
];
