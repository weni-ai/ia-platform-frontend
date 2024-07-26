import { describe, it, expect, vi, beforeEach } from 'vitest';
import qs from '@/utils/QueryString.js';
import request from '@/api/request';
import utils from '@/api/utils';
import user from '@/api/user.js';

vi.mock('@/api/request', () => ({
  default: {
    $http: {
      get: vi.fn(),
      options: vi.fn(),
      put: vi.fn(),
    },
  },
}));

vi.mock('@/api/utils', () => ({
  default: {
    Page: vi.fn(),
  },
}));

describe('user.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get profile', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await user.profile('testnickname');

    expect(request.$http.get).toHaveBeenCalledWith(
      'v2/account/user-profile/testnickname/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get org profile', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await user.org_profile('testnickname');

    expect(request.$http.get).toHaveBeenCalledWith(
      'v2/org/profile/testnickname/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get my profile', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await user.myProfile({ obstructiveErrorProducer: true });

    expect(request.$http.get).toHaveBeenCalledWith('/v2/account/my-profile/', {
      obstructiveErrorProducer: true,
    });
    expect(result).toEqual(mockResponse);
  });

  it('should search by owner with next', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await user.searchByOwner(10, 0, 'owner123', 'next-url');

    expect(request.$http.get).toHaveBeenCalledWith('next-url');
    expect(result).toEqual(mockResponse);
  });

  it('should search by owner without next', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await user.searchByOwner(10, 0, 'owner123');

    expect(request.$http.get).toHaveBeenCalledWith(
      '/v2/repository/search-repositories/',
      {
        params: {
          limit: 10,
          offset: 0,
          owner_id: 'owner123',
          next: undefined,
        },
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get permission repositories', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await user.permissionRepositories();

    expect(request.$http.get).toHaveBeenCalledWith(
      '/v2/repository/repositories-permissions/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get my profile schema', async () => {
    const mockData = {
      actions: { PUT: { field1: 'value1', field2: 'value2' } },
    };
    request.$http.options.mockResolvedValue({ data: mockData });

    const result = await user.getMyProfileSchema();

    expect(request.$http.options).toHaveBeenCalledWith(
      '/v2/account/my-profile/',
    );
    expect(result).toEqual(mockData.actions.PUT);
  });

  it('should update my profile', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.put.mockResolvedValue(mockResponse);

    const result = await user.updateMyProfile(
      'testnickname',
      'testemail@example.com',
      'Test Name',
      'en',
      'Biography',
    );

    expect(request.$http.put).toHaveBeenCalledWith('/v2/account/my-profile/', {
      nickname: 'testnickname',
      email: 'testemail@example.com',
      name: 'Test Name',
      locale: 'en',
      biography: 'Biography',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should get payment history', () => {
    const result = user.getPaymentHistory(5);

    expect(utils.Page).toHaveBeenCalledWith('', 5);
    expect(result).toEqual({});
  });

  it('should get change password schema', async () => {
    const mockData = {
      actions: { PUT: { field1: 'value1', field2: 'value2' } },
    };
    request.$http.options.mockResolvedValue({ data: mockData });

    const result = await user.getChangePasswordSchema();

    expect(request.$http.options).toHaveBeenCalledWith(
      '/v2/account/change-password/',
    );
    expect(result).toEqual(mockData.actions.PUT);
  });

  it('should change password', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.put.mockResolvedValue(mockResponse);

    const result = await user.changePassword('currentPass', 'newPass');

    expect(request.$http.put).toHaveBeenCalledWith(
      '/v2/account/change-password/',
      {
        current_password: 'currentPass',
        password: 'newPass',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should search users', async () => {
    const mockResponse = { data: 'mockData' };
    const query = { name: 'John Doe' };
    const queryString = qs.stringify(query);
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await user.search(query);

    expect(request.$http.get).toHaveBeenCalledWith(
      `/v2/account/search-user/?${queryString}`,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get reports', () => {
    const result = user.getReports('2024-01-01', '2024-12-31', 10);

    expect(utils.Page).toHaveBeenCalledWith(
      '/v2/repository/repository-reports/',
      10,
      {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      },
    );

    expect(result).toEqual({});
  });
});
