import { PatchableUserInfo, UserInfo } from './types';
import { HttpMethod } from './ApiService';

const userInfoServiceURL = 'https://user-service.dajohnston.co.uk/api/v1/user-info';

export const getUserInfo = async (options: RequestInit) => {
  const result = await fetch(userInfoServiceURL, options);
  return (await result.json()) as UserInfo;
};
export const updateUserInfo = async (newUserInfo: PatchableUserInfo, options: RequestInit) => {
  const result = await fetch(userInfoServiceURL, {
    ...options,
    headers: { ...options.headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(newUserInfo),
    method: HttpMethod.PATCH,
  });
  return (await result.json()) as UserInfo;
};
