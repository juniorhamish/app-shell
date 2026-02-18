import { createTheme, ThemeProvider } from '@mui/material';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import TranslationsWrapper from '../../../test-util/TranslationsWrapper';
import { householdsApi } from '../../services/households';
import { setupStore } from '../../store';
import { updateAuthState } from '../auth/authSlice';
import HouseholdSelector from './HouseholdSelector';

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

const meta = {
  component: HouseholdSelector,
  decorators: [
    (Story) => {
      const store = setupStore();

      // Mark as authenticated
      store.dispatch(updateAuthState({ isAuthenticated: true, isLoading: false }));

      // Inject mock data for the households query
      store.dispatch(
        householdsApi.util.upsertQueryData('getHouseholds', undefined, [
          { id: 1, name: 'Household 1' },
          { id: 2, name: 'Household 2' },
          { id: 3, name: 'Household 3' },
        ]),
      );

      return (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <TranslationsWrapper>
              <Box sx={{ alignItems: 'center', backgroundColor: 'primary.main', display: 'inline-flex', p: 4 }}>
                <Story />
              </Box>
            </TranslationsWrapper>
          </ThemeProvider>
        </Provider>
      );
    },
  ],
} satisfies Meta<typeof HouseholdSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
