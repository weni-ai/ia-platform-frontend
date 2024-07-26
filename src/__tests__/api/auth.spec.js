import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from '@/api/request';
import auth from '@/api/auth';

vi.mock('@/api/request', () => ({
  default: {
    $http: {
      options: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
    },
  },
}));

describe('auth.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get login schema', async () => {
    const mockData = {
      actions: { POST: { field1: 'value1', field2: 'value2' } },
    };

    request.$http.options.mockResolvedValue({ data: mockData });

    const result = await auth.getLoginSchema();

    expect(request.$http.options).toHaveBeenCalledWith('/v2/account/login/');
    expect(result).toEqual(mockData.actions.POST);
  });

  it('should login', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await auth.login('testuser', 'testpassword');

    expect(request.$http.post).toHaveBeenCalledWith('/v2/account/login/', {
      username: 'testuser',
      password: 'testpassword',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should get forgot password schema', async () => {
    const mockData = {
      actions: { POST: { field1: 'value1', field2: 'value2' } },
    };
    request.$http.options.mockResolvedValue({ data: mockData });

    const result = await auth.getForgotPasswordSchema();

    expect(request.$http.options).toHaveBeenCalledWith(
      '/v2/account/forgot-password/',
    );
    expect(result).toEqual(mockData.actions.POST);
  });

  it('should send forgot password request', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await auth.forgotPassword('testemail@example.com');

    expect(request.$http.post).toHaveBeenCalledWith(
      '/v2/account/forgot-password/',
      {
        email: 'testemail@example.com',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get reset password schema', async () => {
    const mockData = {
      actions: { PUT: { field1: 'value1', field2: 'value2' } },
    };
    const nickname = 'testnickname';
    request.$http.options.mockResolvedValue({ data: mockData });

    const result = await auth.getResetPasswordSchema(nickname);

    expect(request.$http.options).toHaveBeenCalledWith(
      `/v2/account/reset-password/${nickname}/`,
    );
    expect(result).toEqual(mockData.actions.PUT);
  });

  it('should reset password', async () => {
    const mockResponse = { data: 'mockData' };
    const nickname = 'testnickname';
    request.$http.put.mockResolvedValue(mockResponse);

    const result = await auth.resetPassword(
      nickname,
      'testtoken',
      'newpassword',
    );

    expect(request.$http.put).toHaveBeenCalledWith(
      `/v2/account/reset-password/${nickname}/`,
      {
        token: 'testtoken',
        password: 'newpassword',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get register schema', async () => {
    const mockData = {
      actions: { POST: { field1: 'value1', field2: 'value2' } },
    };
    request.$http.options.mockResolvedValue({ data: mockData });

    const result = await auth.getRegisterSchema();

    expect(request.$http.options).toHaveBeenCalledWith('/v2/account/register/');
    expect(result).toEqual(mockData.actions.POST);
  });

  it('should register a new user', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await auth.register(
      'testemail@example.com',
      'testname',
      'testnickname',
      'testpassword',
    );

    expect(request.$http.post).toHaveBeenCalledWith('/v2/account/register/', {
      email: 'testemail@example.com',
      name: 'testname',
      nickname: 'testnickname',
      password: 'testpassword',
    });
    expect(result).toEqual(mockResponse);
  });
});
