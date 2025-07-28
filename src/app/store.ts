import { combineReducers, configureStore } from '@reduxjs/toolkit';
import drawerReducer from './features/drawer/drawerSlice';
import authReducer from './features/auth/authSlice';
import api from './services/api';

const rootReducer = combineReducers({
  auth: authReducer,
  drawer: drawerReducer,
  [api.reducerPath]: api.reducer,
});

export const setupStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
