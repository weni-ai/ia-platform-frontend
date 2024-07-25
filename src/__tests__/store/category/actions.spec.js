import { describe, it, expect, vi, beforeEach } from 'vitest';
import category from '@/api/category';
import actions from '@/store/category/actions';

vi.mock('@/api/category', () => ({
  default: {
    getAll: vi.fn(),
  },
}));

describe('category actions', () => {
  let store;

  beforeEach(() => {
    store = {
      state: {
        allCategories: null,
      },
    };
    vi.clearAllMocks();
  });

  it('should return cached categories if available', async () => {
    const cachedData = [{ id: 1, name: 'Category 1' }];
    store.state.allCategories = cachedData;

    const result = await actions.getAllCategories(store);

    expect(result.data).toEqual(cachedData);
    expect(category.getAll).not.toHaveBeenCalled();
  });

  it('should fetch categories from API if not cached', async () => {
    const apiResponse = { data: [{ id: 2, name: 'Category 2' }] };
    category.getAll.mockResolvedValue(apiResponse);

    const result = await actions.getAllCategories(store);

    expect(result).toEqual(apiResponse);
    expect(store.state.allCategories).toEqual(apiResponse.data);
    expect(category.getAll).toHaveBeenCalled();
  });

  it('should handle empty API response gracefully', async () => {
    const apiResponse = { data: null };
    category.getAll.mockResolvedValue(apiResponse);

    const result = await actions.getAllCategories(store);

    expect(result).toEqual(apiResponse);
    expect(store.state.allCategories).toBe(null);
    expect(category.getAll).toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'API Error';
    category.getAll.mockRejectedValue(new Error(errorMessage));

    try {
      await actions.getAllCategories(store);
    } catch (error) {
      expect(error.message).toBe(errorMessage);
    }

    expect(store.state.allCategories).toBeNull();
    expect(category.getAll).toHaveBeenCalled();
  });
});
