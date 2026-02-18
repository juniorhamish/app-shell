import type { Household, Invitation } from '../../service/types';
import api from './api';

const invitationsServiceURL = 'https://user-service.dajohnston.co.uk/api/v1/invitations';

export const invitationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    acceptInvitation: build.mutation<Household, number>({
      invalidatesTags: ['Households', 'Invitations'],
      query: (invitationId) => ({
        method: 'POST',
        url: `${invitationsServiceURL}/${invitationId}/accept`,
      }),
    }),
    getInvitations: build.query<Invitation[], void>({
      providesTags: ['Invitations'],
      query: () => invitationsServiceURL,
    }),
    rejectInvitation: build.mutation<void, number>({
      invalidatesTags: ['Invitations'],
      query: (invitationId) => ({
        method: 'DELETE',
        url: `${invitationsServiceURL}/${invitationId}`,
      }),
    }),
  }),
});

export const { useGetInvitationsQuery, useAcceptInvitationMutation, useRejectInvitationMutation } = invitationsApi;
