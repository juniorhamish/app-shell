export const headers = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });
export const enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}
