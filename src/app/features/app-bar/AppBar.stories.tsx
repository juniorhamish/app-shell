import { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import AppBar from './AppBar';
import { setupStore } from '../../store';

const meta = {
  component: AppBar,
  decorators: [(story) => <Provider store={setupStore()}>{story()}</Provider>],
} satisfies Meta<typeof AppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
