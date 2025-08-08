import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import drawerReducer from './features/drawer/drawerSlice';
import api from './services/api';

const rootReducer = combineReducers({
  auth: authReducer,
  drawer: drawerReducer,
  [api.reducerPath]: api.reducer,
});

export const setupStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
    preloadedState,
    reducer: rootReducer,
  });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
