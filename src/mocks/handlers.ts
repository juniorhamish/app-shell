import { HttpResponse, http } from 'msw';
import type { UserInfoResponse } from '../service/types.ts';
import server from './server.ts';

export const mockUserInfoGetRequest = (response: Partial<UserInfoResponse>) => {
  server.use(
    http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', async () => HttpResponse.json(response)),
  );
};

export default [
  http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', () =>
    HttpResponse.json({
      avatarImageSource: 'MANUAL',
      firstName: 'John',
      gravatarEmailAddress: 'jd@email.com',
      lastName: 'Doe',
      nickname: 'JD',
      picture: 'https://me.com/avatar',
    }),
  ),
  http.patch('https://user-service.dajohnston.co.uk/api/v1/user-info', async () => HttpResponse.json({})),
  http.get('https://user-service.dajohnston.co.uk/api/v1/households', () =>
    HttpResponse.json([
      { id: '1', name: 'Household 1' },
      { id: '2', name: 'Household 2' },
    ]),
  ),
];
