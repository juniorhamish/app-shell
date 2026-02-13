import type { Household } from '../../service/types';
import api from './api';

const householdsServiceURL = 'https://user-service.dajohnston.co.uk/api/v1/households';

export const householdsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getHouseholds: build.query<Household[], void>({
      query: () => householdsServiceURL,
    }),
  }),
});

export const { useGetHouseholdsQuery } = householdsApi;
