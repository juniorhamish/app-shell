import '@testing-library/jest-dom/vitest';

import { vi } from 'vitest';
import server from './src/mocks/server';
import { setAuth0Instance } from './src/service/Auth0Instance';

vi.mock('./src/app/remotes/SpiceTrackerRemote.tsx', () => ({ default: () => 'SpiceTrackerRemote' }));

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  setAuth0Instance(null);
});
afterAll(() => server.close());
