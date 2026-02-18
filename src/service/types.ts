export enum AvatarImageSource {
  GRAVATAR = 'GRAVATAR',
  MANUAL = 'MANUAL',
}

export interface Household {
  id: number;
  name: string;
}

export interface Invitation {
  id: number;
  household_id: number;
  household_name: string;
  invited_at: string;
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
