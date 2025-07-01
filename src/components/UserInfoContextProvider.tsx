import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AvatarImageSource, PatchableUserInfo, UserInfo } from '../service/types';
import useUserInfoService from '../service/useUserInfo';

const UserInfoContext = createContext<
  UserInfo & { updateUserInfo: (newUserInfo: PatchableUserInfo) => Promise<UserInfo> }
>({
  email: '',
  gravatarEmailAddress: '',
  firstName: '',
  lastName: '',
  picture: '',
  nickname: '',
  avatarImageSource: AvatarImageSource.GRAVATAR,
  updateUserInfo: () => Promise.reject(),
});
export function UserInfoProvider({ children }: { children: ReactNode }) {
  const { getUserInfo, updateUserInfo } = useUserInfoService();
  const { data } = useQuery<UserInfo>({
    queryKey: ['user-info'],
    queryFn: getUserInfo,
    throwOnError: true,
  });
  const userInfo = useMemo(() => {
    if (!data) {
      return {
        email: '',
        gravatarEmailAddress: '',
        firstName: '',
        lastName: '',
        picture: '',
        nickname: '',
        avatarImageSource: AvatarImageSource.GRAVATAR,
        updateUserInfo,
      };
    }
    return { ...data, updateUserInfo };
  }, [data, updateUserInfo]);
  return <UserInfoContext.Provider value={userInfo}>{children}</UserInfoContext.Provider>;
}

export const useUserInfo = () =>
  useContext<UserInfo & { updateUserInfo: (newUserInfo: PatchableUserInfo) => Promise<UserInfo> }>(UserInfoContext);
