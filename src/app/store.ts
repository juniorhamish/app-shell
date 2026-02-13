import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './features/auth/authSlice';
import drawerReducer from './features/drawer/drawerSlice';
import householdReducer from './features/household/householdSlice';
import api from './services/api';

const rootReducer = combineReducers({
  auth: authReducer,
  drawer: drawerReducer,
  household: householdReducer,
  [api.reducerPath]: api.reducer,
});

export const setupStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
    preloadedState,
    reducer: rootReducer,
  });
  setupListeners(store.dispatch);
  return store;
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
