import { http, HttpResponse } from 'msw';

export default [
  http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', () =>
    HttpResponse.json({
      firstName: 'John',
      lastName: 'Doe',
      avatarImageSource: 'MANUAL',
      picture: 'https://me.com/avatar',
    }),
  ),
];
