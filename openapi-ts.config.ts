import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://user-service.dajohnston.co.uk/spec/openapi.yml',
  output: {
    path: './src/client',
    lint: 'eslint',
    format: 'prettier',
  },
  plugins: ['@hey-api/client-fetch'],
});
