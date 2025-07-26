import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

export interface DrawerState {
  open: boolean;
}

const initialState: DrawerState = {
  open: false,
};

export const drawerSlice = createSlice({
  name: 'drawer',
  initialState,
  reducers: {
    toggleDrawer: (state) => {
      state.open = !state.open;
    },
  },
});

export const { toggleDrawer } = drawerSlice.actions;
export const isDrawerOpen = (state: RootState) => state.drawer.open;
export default drawerSlice.reducer;
