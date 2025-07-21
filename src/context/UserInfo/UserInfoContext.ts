import { createContext } from 'react';
import { AvatarImageSource, PatchableUserInfo, UserInfo } from '../../service/types';

export default createContext<UserInfo & { updateUserInfo: (newUserInfo: PatchableUserInfo) => Promise<UserInfo> }>({
  email: '',
  gravatarEmailAddress: '',
  firstName: '',
  lastName: '',
  picture: '',
  nickname: '',
  avatarImageSource: AvatarImageSource.GRAVATAR,
  updateUserInfo: () => Promise.reject(),
});
