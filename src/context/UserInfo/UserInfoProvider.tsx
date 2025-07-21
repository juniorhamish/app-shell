import { ReactNode, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import useUserInfoService from '../../service/useUserInfo';
import { AvatarImageSource, UserInfo } from '../../service/types';
import UserInfoContext from './UserInfoContext';

export default function UserInfoProvider({ children }: { children: ReactNode }) {
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
