import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

export interface HouseholdState {
  selectedHouseholdId: number | null;
}

const initialState: HouseholdState = {
  selectedHouseholdId: null,
};

export const householdSlice = createSlice({
  initialState,
  name: 'household',
  reducers: {
    selectHousehold: (state, action: PayloadAction<number | null>) => {
      state.selectedHouseholdId = action.payload;
    },
  },
});

export const { selectHousehold } = householdSlice.actions;
export default householdSlice.reducer;
export const selectSelectedHouseholdId = (state: RootState) => state.household.selectedHouseholdId;
