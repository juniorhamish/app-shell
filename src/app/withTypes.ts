import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from './store';

export default createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();
