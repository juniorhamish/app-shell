import { getAuth0Instance } from './Auth0Instance';

export default async function authenticatedFetch(...args: Parameters<typeof fetch>) {
  const [url, options] = args;
  const { getAccessTokenSilently } = getAuth0Instance();
  return fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${await getAccessTokenSilently()}`, ...options?.headers },
  });
}
