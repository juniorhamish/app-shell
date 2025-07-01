export enum AvatarImageSource {
  GRAVATAR = 'GRAVATAR',
  MANUAL = 'MANUAL',
}

export interface UserInfo {
  firstName: string;
  lastName: string;
  readonly email: string;
  nickname: string;
  gravatarEmailAddress: string;
  picture: string;
  avatarImageSource: AvatarImageSource;
}

export type PatchableUserInfo = Partial<UserInfo>;

export interface Error {
  code: number;
  message: string;
}
