import householdReducer, { type HouseholdState, selectHousehold } from './householdSlice';

describe('householdSlice', () => {
  const initialState: HouseholdState = {
    selectedHouseholdId: null,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('should update selectedHouseholdId', () => {
    const state = householdReducer(initialState, selectHousehold(456));
    expect(state.selectedHouseholdId).toBe(456);
  });

  it('should set selectedHouseholdId to null when null is passed', () => {
    const state = householdReducer({ selectedHouseholdId: 123 }, selectHousehold(null));
    expect(state.selectedHouseholdId).toBe(null);
  });
});
