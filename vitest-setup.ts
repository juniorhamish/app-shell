import '@testing-library/jest-dom/vitest';

import server from './src/mocks/server';
import { setAuth0Instance } from './src/service/Auth0Instance';

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  setAuth0Instance(null);
});
afterAll(() => server.close());
