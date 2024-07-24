import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from '@/api/request';
import repository from '@/api/v2/repository';

vi.mock('@/api/request', () => ({
  default: {
    $http: {
      get: vi.fn(),
      post: vi.fn(),
    },
  },
}));

describe('repository.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call GET /v2/repository/:repositoryUuid/ with correct parameters', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const repositoryUuid = 'uuid-repo';
    const result = await repository.get(repositoryUuid);

    expect(request.$http.get).toHaveBeenCalledWith(
      `/v2/repository/${repositoryUuid}/`,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should call GET /v2/repository-shortcut/:ownerNickname/:slug/ with correct parameters', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const ownerNickname = 'owner';
    const slug = 'slug';
    const result = await repository.shortcut(ownerNickname, slug);

    expect(request.$http.get).toHaveBeenCalledWith(
      `/v2/repository-shortcut/${ownerNickname}/${slug}/`,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should call POST /v2/repository/repository-details/ with correct parameters', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const payload = {
      name: 'repoName',
      description: 'repoDescription',
      language: 'JavaScript',
      repository_type: 'public',
      categories: ['category1', 'category2'],
      organization: 'org',
      is_private: false,
    };
    const result = await repository.create(payload);

    expect(request.$http.post).toHaveBeenCalledWith(
      'v2/repository/repository-details/',
      payload,
    );
    expect(result).toEqual(mockResponse);
  });
});
