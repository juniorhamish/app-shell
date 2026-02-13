import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

export interface HouseholdState {
  selectedHouseholdId: number | null;
}

const LOCAL_STORAGE_KEY = 'selectedHouseholdId';

const initialState = (): HouseholdState => ({
  selectedHouseholdId: localStorage.getItem(LOCAL_STORAGE_KEY) ? Number(localStorage.getItem(LOCAL_STORAGE_KEY)) : null,
});

export const householdSlice = createSlice({
  initialState,
  name: 'household',
  reducers: {
    selectHousehold: (state, action: PayloadAction<number | null>) => {
      state.selectedHouseholdId = action.payload;
      if (action.payload) {
        localStorage.setItem(LOCAL_STORAGE_KEY, String(action.payload));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    },
  },
});

export const { selectHousehold } = householdSlice.actions;
export default householdSlice.reducer;
export const selectSelectedHouseholdId = (state: RootState) => state.household.selectedHouseholdId;
