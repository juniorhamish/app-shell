import { useAuth0 } from '@auth0/auth0-react';
import { PatchableUserInfo } from './types';
import { getUserInfo, updateUserInfo } from './UserInfoService';
import { headers } from './ApiService';

const useUserInfoService = () => {
  const { getAccessTokenSilently } = useAuth0();

  return {
    getUserInfo: async () => getUserInfo(headers(await getAccessTokenSilently())),
    updateUserInfo: async (newUserInfo: PatchableUserInfo) =>
      updateUserInfo(newUserInfo, headers(await getAccessTokenSilently())),
  };
};
export default useUserInfoService;
