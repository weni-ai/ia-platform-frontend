import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import category from '@/api/category';

vi.mock('axios', () => ({
  default: {
    create: vi.fn().mockReturnValue({
      get: vi.fn(),
    }),
  },
}));

vi.mock('@/api/request', () => ({
  default: {
    $http: axios.create(),
  },
}));

describe('category.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all categories from the correct endpoint', async () => {
    const mockResponse = { data: ['category1', 'category2'] };
    axios.create().get.mockResolvedValue(mockResponse);

    const result = await category.getAll();

    expect(axios.create().get).toHaveBeenCalledWith(
      '/v2/repository/categories/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should handle error response', async () => {
    const mockError = new Error('Network Error');
    axios.create().get.mockRejectedValue(mockError);

    try {
      await category.getAll();
    } catch (error) {
      expect(error).toBe(mockError);
    }

    expect(axios.create().get).toHaveBeenCalledWith(
      '/v2/repository/categories/',
    );
  });
});
