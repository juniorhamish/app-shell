import type { Auth0ContextInterface } from '@auth0/auth0-react';
import { screen, waitFor, within } from '@testing-library/react';
import { delay, HttpResponse, http, type PathParams } from 'msw';
import { vi } from 'vitest';
import { mockUserInfoGetRequest } from '../../../mocks/handlers.ts';
import server from '../../../mocks/server';
import { setAuth0Instance } from '../../../service/Auth0Instance';
import { AvatarImageSource, type UserInfo } from '../../../service/types.ts';
import renderWithProviders from '../../../test-util/test-utils';
import Drawer from './Drawer';

vi.hoisted(() => {
  vi.stubEnv('RTK_MAX_RETRIES', '0');
});

const authenticatedWithDrawerOpenState = {
  preloadedState: { auth: { isAuthenticated: true, isLoading: false }, drawer: { open: true } },
};
const userProfileForm = async () => await screen.findByRole('form', { name: 'User Profile Form' });
const userAvatar = async () => within(await userProfileForm()).getByAltText('User avatar');
const firstNameField = async () => within(await userProfileForm()).getByRole('textbox', { name: 'First Name' });
const lastNameField = async () => within(await userProfileForm()).getByRole('textbox', { name: 'Last Name' });
const nicknameField = async () => within(await userProfileForm()).getByRole('textbox', { name: 'Nickname' });
const avatarRadioGroup = async () => within(await userProfileForm()).getByRole('radiogroup', { name: 'Avatar Type' });
const manualAvatarRadioOption = async () => within(await avatarRadioGroup()).getByRole('radio', { name: 'Avatar' });
const gravatarAvatarRadioOption = async () => within(await avatarRadioGroup()).getByRole('radio', { name: 'Gravatar' });
const avatarUrlField = async () => within(await userProfileForm()).getByRole('textbox', { name: 'Avatar URL' });
const gravatarEmailAddressField = async () =>
  within(await userProfileForm()).getByRole('textbox', { name: 'Gravatar Email Address' });
const saveButton = async () => within(await userProfileForm()).getByRole('button', { name: 'Save Changes' });
const cancelButton = async () => within(await userProfileForm()).getByRole('button', { name: 'Cancel' });

describe('drawer', () => {
  beforeEach(() => {
    setAuth0Instance({} as Auth0ContextInterface);
  });
  it('should skip the user info request if the user is not yet authenticated', () => {
    renderWithProviders(<Drawer />, {
      preloadedState: { auth: { isAuthenticated: false, isLoading: false }, drawer: { open: true } },
    });

    expect(screen.getByRole('progressbar', { hidden: true })).not.toBeVisible();
  });
  it('should not render the dialog if the drawer is not open', () => {
    renderWithProviders(<Drawer />, { preloadedState: { drawer: { open: false } } });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('should render the dialog if the drawer is open', async () => {
    renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);

    expect(await screen.findByRole('dialog', { name: 'Edit Profile' })).toBeVisible();
  });
  it('should not render the dialog if the auth0 instance is not configured', async () => {
    setAuth0Instance(null);
    renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);

    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
  });
  it('should set the auth header on the user info request', async () => {
    setAuth0Instance({ getAccessTokenSilently: () => Promise.resolve('MyToken') } as Auth0ContextInterface);
    let capturedHeaders: Headers | null = null;
    server.use(
      http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({ success: true });
      }),
    );

    renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);

    await waitFor(() => expect(capturedHeaders?.get('Authorization')).toBe('Bearer MyToken'));
  });
  it('should set the auth header on the user info request using the popup for token when silent fails', async () => {
    setAuth0Instance({
      getAccessTokenSilently: () => Promise.reject(),
      getAccessTokenWithPopup: () => Promise.resolve('Popup Token'),
    } as Auth0ContextInterface);
    let capturedHeaders: Headers | null = null;
    server.use(
      http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({ success: true });
      }),
    );

    renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);

    await waitFor(() => expect(capturedHeaders?.get('Authorization')).toBe('Bearer Popup Token'));
  });
  it('should show a spinner while the user info is loading', () => {
    server.use(
      http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', async () => {
        await delay('infinite');
        return HttpResponse.json({});
      }),
    );

    renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);

    expect(screen.getByRole('progressbar', { name: 'User info loading.' })).toBeVisible();
    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
  });
  it('should show a message when the user info fails to load', async () => {
    server.use(http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', async () => HttpResponse.error()));

    renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);

    expect(await screen.findByText('Failed to load user info.')).toBeVisible();
  });
  it('should show a sub-heading', async () => {
    renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);

    expect(await screen.findByText('Update your profile information below')).toBeVisible();
  });
  it('should populate the form with the current values from the user-info API', async () => {
    mockUserInfoGetRequest({
      avatarImageSource: AvatarImageSource.MANUAL,
      firstName: 'Dave',
      lastName: 'Johnston',
      nickname: 'DJ',
      picture: 'https://me.com/avatar',
    });
    renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);

    expect(await userAvatar()).toHaveAttribute('src', 'https://me.com/avatar');
    expect(await firstNameField()).toHaveValue('Dave');
    expect(await lastNameField()).toHaveValue('Johnston');
    expect(await nicknameField()).toHaveValue('DJ');
    expect(await manualAvatarRadioOption()).toBeChecked();
    expect(await gravatarAvatarRadioOption()).not.toBeChecked();
    expect(await avatarUrlField()).toHaveValue('https://me.com/avatar');
  });
  it('should set the gravatar URL based on the email address', async () => {
    mockUserInfoGetRequest({
      avatarImageSource: AvatarImageSource.GRAVATAR,
      gravatarEmailAddress: 'gravatar@email.com',
    });
    renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);

    expect(await userAvatar()).toHaveAttribute(
      'src',
      'https://www.gravatar.com/avatar/bd9ce1e303f62efea7abeaae30288a43',
    );
    expect(await manualAvatarRadioOption()).not.toBeChecked();
    expect(await gravatarAvatarRadioOption()).toBeChecked();
    expect(await gravatarEmailAddressField()).toHaveValue('gravatar@email.com');
  });
  it('should set the gravatar URL when the email address is not present', async () => {
    mockUserInfoGetRequest({ avatarImageSource: AvatarImageSource.GRAVATAR });
    renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);

    expect(await userAvatar()).toHaveAttribute(
      'src',
      'https://www.gravatar.com/avatar/d41d8cd98f00b204e9800998ecf8427e',
    );
  });
  it('should enable the save and cancel buttons when first name field is edited', async () => {
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.clear(await firstNameField());
    await user.type(await firstNameField(), ' David');

    expect(await saveButton()).toBeEnabled();
    expect(await cancelButton()).toBeEnabled();
  });
  it('should enable the save and cancel buttons when last name field is edited', async () => {
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.clear(await lastNameField());
    await user.type(await lastNameField(), 'Johnston');

    expect(await saveButton()).toBeEnabled();
    expect(await cancelButton()).toBeEnabled();
  });
  it('should enable the save and cancel buttons when nickname field is edited', async () => {
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.clear(await nicknameField());
    await user.type(await nicknameField(), 'DJ');

    expect(await saveButton()).toBeEnabled();
    expect(await cancelButton()).toBeEnabled();
  });
  it('should enable the save and cancel buttons when avatar image source field is edited', async () => {
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.click(await gravatarAvatarRadioOption());

    expect(await saveButton()).toBeEnabled();
    expect(await cancelButton()).toBeEnabled();
  });
  it('should enable the save and cancel buttons when avatar URL field is edited', async () => {
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.clear(await avatarUrlField());
    await user.type(await avatarUrlField(), 'https://dj.com/avatar');

    expect(await saveButton()).toBeEnabled();
    expect(await cancelButton()).toBeEnabled();
  });
  it('should reset all fields when fields are edited and cancel is clicked', async () => {
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.type(await firstNameField(), 'x');
    await user.type(await lastNameField(), 'x');
    await user.type(await nicknameField(), 'x');
    await user.type(await avatarUrlField(), 'x');
    await user.click(await gravatarAvatarRadioOption());

    await user.click(await cancelButton());

    expect(await saveButton()).not.toBeEnabled();
    expect(await cancelButton()).not.toBeEnabled();
    expect(await userAvatar()).toHaveAttribute('src', 'https://me.com/avatar');
    expect(await firstNameField()).toHaveValue('John');
    expect(await lastNameField()).toHaveValue('Doe');
    expect(await nicknameField()).toHaveValue('JD');
    expect(await manualAvatarRadioOption()).toBeChecked();
    expect(await gravatarAvatarRadioOption()).not.toBeChecked();
    expect(await avatarUrlField()).toHaveValue('https://me.com/avatar');
  });
  it('should invoke the update API when changes are saved', async () => {
    server.use(
      http.patch<PathParams, UserInfo>(
        'https://user-service.dajohnston.co.uk/api/v1/user-info',
        async ({ request }) => {
          const data = await request.json();
          if (
            data.firstName !== 'David' ||
            data.lastName !== 'Johnston' ||
            data.nickname !== 'DJ' ||
            data.avatarImageSource !== 'GRAVATAR' ||
            data.gravatarEmailAddress !== 'dj@email.com'
          ) {
            return HttpResponse.error();
          }
          return HttpResponse.json({ success: true });
        },
      ),
    );
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.clear(await firstNameField());
    await user.type(await firstNameField(), 'David');
    await user.clear(await lastNameField());
    await user.type(await lastNameField(), 'Johnston');
    await user.clear(await nicknameField());
    await user.type(await nicknameField(), 'DJ');
    await user.click(await gravatarAvatarRadioOption());
    await user.clear(await gravatarEmailAddressField());
    await user.type(await gravatarEmailAddressField(), 'dj@email.com');
    await user.click(await saveButton());

    expect(await screen.findByRole('alert', { hidden: true })).toHaveTextContent('Profile updated successfully');
  });
  it('should show an error alert when updating user fails', async () => {
    server.use(
      http.patch<PathParams, UserInfo>('https://user-service.dajohnston.co.uk/api/v1/user-info', async () => {
        return HttpResponse.error();
      }),
    );
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.type(await firstNameField(), 'x');
    await user.click(await saveButton());

    expect(await screen.findByRole('alert', { hidden: true })).toHaveTextContent('Failed to update profile');
  });
  it('should close the alert on escape', async () => {
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.type(await firstNameField(), 'x');
    await user.click(await saveButton());
    expect(await screen.findByText('Profile updated successfully')).toBeVisible();

    await user.keyboard('{Escape}');
    await user.keyboard('{Escape}');

    expect(screen.queryByText('Profile updated successfully')).not.toBeInTheDocument();
  });
  it('should not close the alert by clicking elsewhere on the screen', async () => {
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.type(await firstNameField(), 'x');
    await user.click(await saveButton());
    expect(await screen.findByText('Profile updated successfully')).toBeVisible();

    await user.click(await firstNameField());

    expect(await screen.findByText('Profile updated successfully')).toBeVisible();
  });
  it('should disable all fields while the update request is in progress', async () => {
    server.use(
      http.patch<PathParams, UserInfo>('https://user-service.dajohnston.co.uk/api/v1/user-info', async () => {
        await delay('infinite');
        return HttpResponse.error();
      }),
    );
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.type(await firstNameField(), 'x');
    await user.click(await saveButton());

    expect(await saveButton()).not.toBeEnabled();
    expect(await cancelButton()).not.toBeEnabled();
    expect(await firstNameField()).not.toBeEnabled();
    expect(await lastNameField()).not.toBeEnabled();
    expect(await nicknameField()).not.toBeEnabled();
    expect(await manualAvatarRadioOption()).not.toBeEnabled();
    expect(await gravatarAvatarRadioOption()).not.toBeEnabled();
    expect(await avatarUrlField()).not.toBeEnabled();
  });
  it('should show a validation message when first name is not set', async () => {
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.clear(await firstNameField());
    await user.tab();

    expect(screen.getByText('Required')).toBeVisible();
    expect(await saveButton()).not.toBeEnabled();
  });
  it('should show a validation message when last name is not set', async () => {
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.clear(await lastNameField());
    await user.tab();

    expect(screen.getByText('Required')).toBeVisible();
    expect(await saveButton()).not.toBeEnabled();
  });
  it('should show a validation message when nickname is not set', async () => {
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.clear(await nicknameField());
    await user.tab();

    expect(screen.getByText('Required')).toBeVisible();
    expect(await saveButton()).not.toBeEnabled();
  });
  it('should show a validation message when avatar URL is not set', async () => {
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.clear(await avatarUrlField());
    await user.tab();

    expect(screen.getByText('Required')).toBeVisible();
    expect(await saveButton()).not.toBeEnabled();
  });
  it('should show a validation message when avatar URL is not a valid address', async () => {
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.clear(await avatarUrlField());
    await user.type(await avatarUrlField(), 'not an address');
    await user.tab();

    expect(screen.getByText('Must be a valid URL')).toBeVisible();
    expect(await saveButton()).not.toBeEnabled();
  });
  it('should show a validation message when gravatar email address is not set', async () => {
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.click(await gravatarAvatarRadioOption());
    await user.clear(await gravatarEmailAddressField());
    await user.tab();

    expect(screen.getByText('Required')).toBeVisible();
    expect(await saveButton()).not.toBeEnabled();
  });
  it('should show a validation message when gravatar email address is not valid email address', async () => {
    const { user } = renderWithProviders(<Drawer />, authenticatedWithDrawerOpenState);
    await user.click(await gravatarAvatarRadioOption());
    await user.clear(await gravatarEmailAddressField());
    await user.type(await gravatarEmailAddressField(), 'not an email address');
    await user.tab();

    expect(screen.getByText('Must be a valid email address')).toBeVisible();
    expect(await saveButton()).not.toBeEnabled();
  });
});
