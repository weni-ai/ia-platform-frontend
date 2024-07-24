import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from '@/api/request';
import integration from '@/api/integration.js';

vi.mock('@/api/request', () => ({
  default: {
    $http: {
      get: vi.fn(),
      post: vi.fn(),
    },
  },
}));

describe('integration.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should verify integrate repository', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await integration.verifyIntegrateRepository(
      'v1',
      'uuid-repo',
      'uuid-proj',
      'org',
    );

    expect(request.$http.get).toHaveBeenCalledWith(
      '/v2/repository/info/uuid-repo/v1/projectrepository/?project_uuid=uuid-proj&organization=org',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should integrate repository', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await integration.integrateRepository(
      'v1',
      'uuid-repo',
      'repo-name',
      'uuid-proj',
      'org',
    );

    expect(request.$http.post).toHaveBeenCalledWith(
      '/v2/repository/info/uuid-repo/v1/add_repository_project/',
      {
        project_uuid: 'uuid-proj',
        name: 'repo-name',
        organization: 'org',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should disintegrate repository', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await integration.disintegrateRepository(
      'v1',
      'uuid-repo',
      'uuid-proj',
      'org',
    );

    expect(request.$http.post).toHaveBeenCalledWith(
      '/v2/repository/info/uuid-repo/v1/remove_repository_project/',
      {
        project_uuid: 'uuid-proj',
        organization: 'org',
      },
    );
    expect(result).toEqual(mockResponse);
  });
});
