import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import { getAuth0Instance } from '../../service/Auth0Instance';

const baseQuery = fetchBaseQuery({
  prepareHeaders: async (headers) => {
    const auth0Instance = getAuth0Instance();
    if (!auth0Instance.getAccessTokenSilently) {
      return headers;
    }
    let token: string | undefined;
    try {
      token = await auth0Instance.getAccessTokenSilently();
    } catch (_error) {
      token = await auth0Instance.getAccessTokenWithPopup();
    }
    headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});
const baseQueryWithRetry = retry(baseQuery, {
  maxRetries: Number.isFinite(Number(import.meta.env.RTK_MAX_RETRIES))
    ? Number(import.meta.env.RTK_MAX_RETRIES)
    : undefined,
});

export default createApi({
  baseQuery: baseQueryWithRetry,
  endpoints: () => ({}),
  reducerPath: 'appShellService',
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ['User'],
});
