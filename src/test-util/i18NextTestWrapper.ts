import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import TranslationsWrapper from './TranslationsWrapper';

export default (ui: ReactElement, options?: RenderOptions) => render(ui, { wrapper: TranslationsWrapper, ...options });
