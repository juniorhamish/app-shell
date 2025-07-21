import { useContext } from 'react';
import { PatchableUserInfo, UserInfo } from '../../service/types';
import UserInfoContext from './UserInfoContext';

export default () =>
  useContext<UserInfo & { updateUserInfo: (newUserInfo: PatchableUserInfo) => Promise<UserInfo> }>(UserInfoContext);
