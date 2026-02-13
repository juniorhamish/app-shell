import householdReducer, { type HouseholdState, selectHousehold } from './householdSlice';

describe('householdSlice', () => {
  const initialState: HouseholdState = {
    selectedHouseholdId: null,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize from localStorage', () => {
    localStorage.setItem('selectedHouseholdId', '789');
    // We need to reload the module or re-evaluate the initial state logic
    // Since it's a default export of the reducer, we can check its initial state by calling it with an empty action
    const state = householdReducer(undefined, { type: 'unknown' });
    expect(state.selectedHouseholdId).toBe(789);
  });

  it('should update selectedHouseholdId and save to localStorage', () => {
    const state = householdReducer(initialState, selectHousehold(456));
    expect(state.selectedHouseholdId).toBe(456);
    expect(localStorage.getItem('selectedHouseholdId')).toBe('456');
  });

  it('should remove selectedHouseholdId from localStorage when null is passed', () => {
    localStorage.setItem('selectedHouseholdId', '123');
    const state = householdReducer({ selectedHouseholdId: 123 }, selectHousehold(null));
    expect(state.selectedHouseholdId).toBe(null);
    expect(localStorage.getItem('selectedHouseholdId')).toBe(null);
  });
});
