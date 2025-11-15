import type { useAuth0 } from '@auth0/auth0-react';

type Auth0Client = ReturnType<typeof useAuth0>;

let auth0Instance: Auth0Client | null = null;

export const setAuth0Instance = (instance: Auth0Client | null) => {
  auth0Instance = instance;
};

export const getAuth0Instance = () => auth0Instance;
