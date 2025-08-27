import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type React from 'react';
import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import type { AppStore, RootState } from '../app/store';
import { setupStore } from '../app/store';
import TranslationsWrapper from './TranslationsWrapper';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

export default function renderWithProviders(ui: React.ReactElement, extendedRenderOptions: ExtendedRenderOptions = {}) {
  const { preloadedState = {}, store = setupStore(preloadedState), ...renderOptions } = extendedRenderOptions;

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <TranslationsWrapper>{children}</TranslationsWrapper>
      </Provider>
    );
  }

  const user = userEvent.setup();
  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    user,
  };
}
