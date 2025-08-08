import { AvatarImageSource, type UserInfo, type UserInfoResponse } from '../../service/types';
import emailAddressToGravatarUrl from '../../util/utils';
import api from './api';

const userInfoServiceURL = 'https://user-service.dajohnston.co.uk/api/v1/user-info';

export const userInfoApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUserInfo: build.query<UserInfo, void>({
      providesTags: () => ['User'],
      query: () => userInfoServiceURL,
      transformResponse: (baseQueryReturnValue: UserInfoResponse) => ({
        ...baseQueryReturnValue,
        resolvedPicture:
          baseQueryReturnValue.avatarImageSource === AvatarImageSource.GRAVATAR
            ? emailAddressToGravatarUrl(baseQueryReturnValue.gravatarEmailAddress ?? '')
            : baseQueryReturnValue.picture,
      }),
    }),
    updateUserInfo: build.mutation<UserInfo, Partial<UserInfoResponse>>({
      invalidatesTags: () => ['User'],
      query: ({ ...body }) => ({
        body,
        method: 'PATCH',
        url: userInfoServiceURL,
      }),
    }),
  }),
});

export const { useGetUserInfoQuery, useUpdateUserInfoMutation } = userInfoApi;
