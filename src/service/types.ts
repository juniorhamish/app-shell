export enum AvatarImageSource {
  GRAVATAR = 'GRAVATAR',
  MANUAL = 'MANUAL',
}

export interface UserInfoResponse {
  firstName: string;
  lastName: string;
  readonly email: string;
  nickname: string;
  gravatarEmailAddress: string;
  picture: string;
  avatarImageSource: AvatarImageSource;
}

export type UserInfo = UserInfoResponse & { resolvedPicture: string };
