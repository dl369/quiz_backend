import request from 'sync-request-curl';
import config from './config.json';

const port = config.port;
const url = config.url;
const baseUrl = `${url}:${port}/v1`;

beforeEach(() => {
  request('DELETE', `${baseUrl}/clear`);
});

afterAll(() => {
  request('DELETE', `${baseUrl}/clear`);
});

describe('Clear HTTP Tests', () => {
  test('should reset the data store to its initial state', () => {
    // Simulate adding data to the data store
    let res = request('POST', `${url}:${port}/v1/admin/auth/register`, {
      json: {
        email: 'john.doe@example.com',
        password: 'password123',
        nameFirst: 'John',
        nameLast: 'Doe',
      },
      timeout: 1000,
    });
    let bodyObj = JSON.parse(String(res.body));
    expect(bodyObj).toEqual({ token: expect.any(String) });

    // Clear the data
    const clear = request('DELETE', `${url}:${port}/v1/clear`);
    expect(JSON.parse(clear.body.toString())).toEqual({});
    // Try registering the same user again after the clear
    res = request('POST', `${url}:${port}/v1/admin/auth/register`, {
      json: {
        email: 'john.doe@example.com',
        password: 'password123',
        nameFirst: 'John',
        nameLast: 'Doe',
      },
      timeout: 1000,
    });
    bodyObj = JSON.parse(res.getBody().toString());
    expect(bodyObj).toEqual({ token: expect.any(String) });
  });
});

describe('Server Tests', () => {
  test('server error', () => {
    // Simulate adding data to the data store
    const res = request('POST', `${url}:${port}/v1/error`, {
      json: {
      },
    });
    const bodyObj = JSON.parse(String(res.body));
    expect(bodyObj).toEqual({ error: expect.any(String) });
  });
  test('server /', () => {
    const res = request('GET', `${url}:${port}/`, {
      followRedirects: false,
    });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/docs');
  });
});
