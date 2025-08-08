import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

export interface DrawerState {
  open: boolean;
}

const initialState: DrawerState = {
  open: false,
};

export const drawerSlice = createSlice({
  initialState,
  name: 'drawer',
  reducers: {
    toggleDrawer: (state) => {
      state.open = !state.open;
    },
  },
});

export const { toggleDrawer } = drawerSlice.actions;
export const selectIsDrawerOpen = (state: RootState) => state.drawer.open;
export default drawerSlice.reducer;
