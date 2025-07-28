import { AvatarImageSource, UserInfo, UserInfoResponse } from '../../service/types';
import api from './api';
import emailAddressToGravatarUrl from '../../util/utils';

const userInfoServiceURL = 'https://user-service.dajohnston.co.uk/api/v1/user-info';

export const userInfoApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUserInfo: build.query<UserInfo, void>({
      query: () => userInfoServiceURL,
      providesTags: () => ['User'],
      transformResponse: (baseQueryReturnValue: UserInfoResponse) => ({
        ...baseQueryReturnValue,
        resolvedPicture:
          baseQueryReturnValue.avatarImageSource === AvatarImageSource.GRAVATAR
            ? emailAddressToGravatarUrl(baseQueryReturnValue.gravatarEmailAddress ?? '')
            : baseQueryReturnValue.picture,
      }),
    }),
    updateUserInfo: build.mutation<UserInfo, Partial<UserInfoResponse>>({
      query: ({ ...body }) => ({
        url: userInfoServiceURL,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: () => ['User'],
    }),
  }),
});

export const { useGetUserInfoQuery, useUpdateUserInfoMutation } = userInfoApi;
