import { createContext, ReactNode, useCallback, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserInfo, PatchUserInfoWritable, updateUserInfo, UserInfoReadable } from '../client';

const UserInfoContext = createContext<
  UserInfoReadable & { saveUserInfoChanges: (newUserInfo: PatchUserInfoWritable) => Promise<void> }
>({
  email: '',
  gravatarEmailAddress: '',
  firstName: '',
  lastName: '',
  picture: '',
  nickname: '',
  saveUserInfoChanges: () => Promise.resolve(),
});
export function UserInfoProvider({ children }: { children: ReactNode }) {
  const { getAccessTokenSilently } = useAuth0();
  const { data } = useQuery<UserInfoReadable>({
    queryKey: ['user-info'],
    queryFn: async () => {
      const result = await getUserInfo({ headers: { Authorization: `Bearer ${await getAccessTokenSilently()}` } });
      return result.data ?? {};
    },
    throwOnError: true,
  });
  const saveUserInfoChanges = useCallback(
    async (newUserInfo: PatchUserInfoWritable) => {
      await updateUserInfo({
        body: newUserInfo,
        headers: { Authorization: `Bearer ${await getAccessTokenSilently()}` },
      });
    },
    [getAccessTokenSilently],
  );
  const userInfo = useMemo(() => {
    if (!data) {
      return {
        email: '',
        gravatarEmailAddress: '',
        firstName: '',
        lastName: '',
        picture: '',
        nickname: '',
        saveUserInfoChanges,
      };
    }
    return { ...data, saveUserInfoChanges };
  }, [data, saveUserInfoChanges]);
  return <UserInfoContext.Provider value={userInfo}>{children}</UserInfoContext.Provider>;
}

export const useUserInfo = () =>
  useContext<UserInfoReadable & { saveUserInfoChanges: (newUserInfo: PatchUserInfoWritable) => Promise<void> }>(
    UserInfoContext,
  );
