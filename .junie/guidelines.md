Project Development Guidelines

Scope: This document captures project-specific build, configuration, testing, and development practices for the app-shell repository. It assumes an advanced developer familiar with React, Vite, Vitest, MSW, RTK Query, Redux Toolkit, and Storybook.

1. Build and Configuration

- Toolchain and versions
  - Vite 7 with @vitejs/plugin-react-swc
  - React 19, TypeScript 5.8
  - Node: developed and tested with Node 20+ (LTS recommended). Earlier Node 18+ may work but is not verified.
- Scripts (package.json)
  - dev: vite
  - build: tsc -b && vite build
  - preview: vite preview
  - lint: eslint .
  - prettier:check / prettier:write: run Prettier in check or write mode
  - test: vitest (watch mode by default)
  - test:ci: DEBUG_PRINT_LIMIT=99999 vitest run --coverage (non-watch, JUnit + coverage reports)
  - storybook: storybook dev -p 6006
  - build-storybook: storybook build
  - chromatic: npx chromatic
- Vite configuration (vite.config.ts)
  - Plugins: React SWC, rollup-plugin-visualizer (outputs reports/stats.html), and @originjs/vite-plugin-federation.
  - Module Federation is configured with name app_shell and a remote spiceTracker pointing to https://spice-tracker.dajohnston.co.uk/assets/remoteEntry.js. Build/preview requires network access to resolve remotes at runtime if used.
  - build.target: esnext (modern output).
  - Test-specific config is embedded in vite.config.ts under test (see Testing section).
- TypeScript configuration
  - tsconfig.app.json targets ES2024 + DOM and sets types: ["vitest/globals", "@testing-library/jest-dom"].
  - tsconfig.node.json includes vite.config.ts, vitest-setup.ts, and .storybook/\*.
- Linting/Formatting
  - ESLint: Flat config (eslint.config.js) composed from eslint-config-airbnb-extended, @stylistic, import-x, React, React Hooks, jsx-a11y, vitest, redux plugin, and storybook plugin. Prettier config is applied last for compat.
  - Special rules:
    - For slice files (files matching src/\**/*Slice.ts), no-param-reassign props rule is relaxed.
    - Test and storybook files allow devDependencies imports.
  - Prettier 3 is used for formatting. Run prettier:write before committing large changes.

2. Testing

- Test runner and environment
  - Vitest 3.x, environment: jsdom, globals: true (configured in vite.config.ts).
  - setupFiles: vitest-setup.ts runs once per test session.
  - Reporters: default and junit; JUnit XML is written to reports/junit-report.xml. Coverage provider: v8 with reporters [json, html, lcov, text]. Coverage is included/excluded per vite.config.ts.
  - Memory hygiene: logHeapUsage, clearMocks, restoreMocks, and mockReset are enabled.
- Test setup (vitest-setup.ts)
  - Imports @testing-library/jest-dom/vitest for jest-dom matchers.
  - Sets up MSW server (src/mocks/server.ts) once via server.listen().
  - Resets MSW handlers and clears the Auth0 instance between tests:
    - server.resetHandlers()
    - setAuth0Instance(null) — this is important because RTK Query’s baseQuery reads tokens via getAuth0Instance().
  - Closes the MSW server after all tests.
- Rendering React under test
  - Use src/test-util/test-utils.tsx: renderWithProviders(ui, { preloadedState?, store?, ...renderOptions })
    - Wraps components with Redux Provider using setupStore from src/app/store.ts.
    - Includes an i18n wrapper (src/test-util/TranslationsWrapper.tsx) that preloads English translations from public/locales/en/translation.json. i18n debug is enabled during tests, so you will see i18next logs in test output.
  - Prefer renderWithProviders for any component that depends on Redux, RTK Query, or translations.
- Network mocking
  - MSW (src/mocks/handlers.ts) defines default handlers. Use server.use(...) within tests to override for a specific scenario. Example:
    - import { http, HttpResponse } from 'msw'
    - server.use(http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', () => HttpResponse.json({ ... })))
- Auth0 mocking
  - Components reference @auth0/auth0-react and some logic depends on getAuth0Instance() (src/service/Auth0Instance.ts), which is used by RTK Query (src/app/services/api.ts) to inject Authorization headers.
  - In component tests:
    - vi.mock('@auth0/auth0-react') and stub useAuth0() to control auth state and behaviors (loginWithRedirect, logout, etc.).
    - For API header assertions, set the instance directly:
      - setAuth0Instance({ getAccessTokenSilently: async () => 'MyToken' } as Auth0ContextInterface)
- Store and RTK Query
  - The app’s RTK Query api uses retry(baseQuery, { maxRetries: 6 }). When writing tests that intentionally fail a request, consider that retries may affect timing. Use waitFor appropriately or override the handler to respond immediately with the final intended response.
- File conventions
  - Tests colocated under src alongside code. Naming: _.test.ts, _.test.tsx (Vitest default discovery applies).
- Running tests
  - Watch mode: npm test
  - CI mode (no watch; coverage + reports): npm run test:ci
  - Filter tests by name: vitest -t "partial name"
  - Run a single file: vitest run src/path/to/file.test.tsx
- Demonstrated test flow (verified locally during guideline creation)
  - Added a minimal test at src/sample.guidelines.test.tsx exercising renderWithProviders and RTL APIs.
  - Ran npm run test:ci confirming success and coverage generation.
  - Removed the temporary test file afterward to keep the repository clean, as required by the task instructions.

3. Additional Development Information

- i18n during tests
  - i18next is initialized once in TranslationsWrapper with debug: true and English resources. If a component uses t('key') not present in public/locales/en/translation.json, you’ll see raw keys or warnings in logs; update translation.json for stable test output.
- MSW best practices
  - Prefer overriding handlers per test using server.use(...) rather than mutating global handlers. server.resetHandlers() is executed after each test by setup to guarantee isolation.
- Auth0 integration details for tests
  - When your test only needs to control UI auth state (e.g., show/hide Sign in button), mocking useAuth0() is sufficient.
  - When your code path fetches data via RTK Query (which injects Authorization via getAuth0Instance()), also set setAuth0Instance(...) as needed. If you don’t, getAuth0Instance() will throw and your component may short-circuit; some tests assert this behavior explicitly.
- Linting, formatting, and type checks
  - ESLint flat config is comprehensive and tuned for React, Vitest, Redux Toolkit, and Storybook. Run npm run lint. For TS errors, use the TypeScript language service in your IDE; builds are type-checked via tsc -b.
  - Prettier must be kept in sync; run npm run prettier:check in CI/pre-commit and prettier:write locally to fix.
- Visualizing bundles
  - rollup-plugin-visualizer produces reports/stats.html on build; open it to understand bundle size and module federation sharing.
- Storybook and Chromatic
  - Storybook dev: npm run storybook
  - Storybook build: npm run build-storybook
  - Chromatic publish: npm run chromatic
  - ESLint includes storybook-specific rules; stories are excluded from test coverage.
- Dependency best practices
  - Use latest versions of all dependencies.
  - Avoid using deprecated parameters in all library usages.

4. Quickstart Commands

- Install deps: npm ci (or npm i)
- Start dev server: npm run dev
- Type-check + build: npm run build
- Preview production build: npm run preview
- Lint: npm run lint
- Format (write): npm run prettier:write
- Run tests (watch): npm test
- Run tests (CI with coverage): npm run test:ci

5. Adding a New Test — Example

- Example test pattern leveraging project utilities and MSW:

  // src/some/feature/MyWidget.test.tsx
  import { screen } from '@testing-library/react';
  import { http, HttpResponse } from 'msw';
  import renderWithProviders from '../../test-util/test-utils';
  import server from '../../mocks/server';
  import MyWidget from './MyWidget';

  describe('MyWidget', () => {
  it('renders server-provided data', async () => {
  server.use(
  http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', () =>
  HttpResponse.json({ firstName: 'Ada', lastName: 'Lovelace' }),
  ),
  );
  renderWithProviders(<MyWidget />);
  expect(await screen.findByText('Ada Lovelace')).toBeVisible();
  });
  });

Notes

- Do not disable the MSW server in tests; vitest-setup.ts controls lifecycle globally.
- If a test modifies Auth0 state through setAuth0Instance, you don’t need to clean up — setup resets it after each test.
- When debugging async behaviors, prefer await screen.findBy..., waitFor, and ViTest’s fake timers if necessary.

This document is intentionally concise and focused on the project’s specifics so experienced developers can move fast without rediscovering conventions already established in this codebase.
