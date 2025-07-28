import { md5 } from 'js-md5';

export default (emailAddress: string) => {
  const hash = md5(emailAddress.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}`;
};
