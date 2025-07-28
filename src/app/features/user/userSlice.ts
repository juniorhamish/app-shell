import { createSlice } from '@reduxjs/toolkit';
import type { UserInfo } from '../../../service/types';
import authenticatedFetch from '../../../service/AuthenticatedFetch';
import createAppAsyncThunk from '../../withTypes';

const userInfoServiceURL = 'https://user-service.dajohnston.co.uk/api/v1/user-info';

interface UserState {
  userInfo?: UserInfo;
  status: 'idle' | 'loading' | 'successful' | 'failed';
}

export const loadUserInfo = createAppAsyncThunk('user/loadUserInfo', async () => {
  const result = await authenticatedFetch(userInfoServiceURL);
  if (!result.ok) {
    throw new Error(`HTTP error! status ${result.status}`);
  }
  return (await result.json()) as UserInfo;
});

const initialState: UserState = {
  status: 'idle',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  selectors: {
    selectUserInfoStatus: (state) => state.status,
    selectUserFirstName: (state) => state.userInfo?.firstName,
    selectUserLastName: (state) => state.userInfo?.lastName,
    selectNickname: (state) => state.userInfo?.nickname,
    selectPicture: (state) => state.userInfo?.picture,
    selectGravatarEmailAddress: (state) => state.userInfo?.gravatarEmailAddress,
    selectAvatarSource: (state) => state.userInfo?.avatarImageSource,
  },
  extraReducers(builder) {
    builder
      .addCase(loadUserInfo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadUserInfo.fulfilled, (state, action) => {
        state.status = 'successful';
        state.userInfo = action.payload;
      })
      .addCase(loadUserInfo.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default userSlice.reducer;
export const {
  selectUserFirstName,
  selectUserLastName,
  selectNickname,
  selectPicture,
  selectGravatarEmailAddress,
  selectAvatarSource,
  selectUserInfoStatus,
} = userSlice.selectors;
