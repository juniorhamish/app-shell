import type { Household } from '../../service/types';
import api from './api';

const householdsServiceURL = 'https://user-service.dajohnston.co.uk/api/v1/households';

export interface CreateHouseholdRequest {
  name: string;
  invitations?: string[];
}

export const householdsApi = api.injectEndpoints({
  endpoints: (build) => ({
    createHousehold: build.mutation<Household, CreateHouseholdRequest>({
      invalidatesTags: ['Households'],
      query: (body) => ({
        body,
        method: 'POST',
        url: householdsServiceURL,
      }),
    }),
    getHouseholds: build.query<Household[], void>({
      providesTags: ['Households'],
      query: () => householdsServiceURL,
    }),
  }),
});

export const { useGetHouseholdsQuery, useCreateHouseholdMutation } = householdsApi;
