import { HttpResponse, http } from 'msw';

export default [
  http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', () =>
    HttpResponse.json({
      avatarImageSource: 'MANUAL',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://me.com/avatar',
    }),
  ),
];
