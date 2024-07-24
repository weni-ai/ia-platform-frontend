import { describe, it, expect, vi, beforeEach } from 'vitest';
import Page from '@/api/utils/Page';
import request from '@/api/request';
import requestExternal from '@/api/requestExternal';
import qs from '@/utils/QueryString';

vi.mock('@/api/request', () => ({
  default: {
    $http: {
      get: vi.fn(),
    },
  },
}));

vi.mock('@/utils/QueryString', () => ({
  default: {
    stringify: vi.fn(),
  },
}));

vi.mock('@/api/requestExternal', () => ({
  default: {
    $http: vi.fn().mockReturnValue({
      get: vi.fn(),
    }),
  },
}));

describe('Page.js', () => {
  let page;

  beforeEach(() => {
    vi.clearAllMocks();
    page = new Page('http://example.com', 10);
  });

  it('should initialize correctly', () => {
    expect(page.baseUrl).toBe('http://example.com');
    expect(page.perPage).toBe(10);
    expect(page.params).toEqual({});
    expect(page.token).toBe(null);
    expect(page.total).toBe(0);
    expect(page.items).toEqual([]);
    expect(page.loading).toBe(false);
  });

  it('should update items successfully', async () => {
    const mockResponse = { data: { count: 2, results: [1, 2] } };
    page.fetchItems = vi.fn().mockResolvedValue(mockResponse);

    const items = await page.updateItems(1);

    expect(page.fetchItems).toHaveBeenCalledWith(1);
    expect(page.items).toEqual([1, 2]);
    expect(page.total).toBe(2);
    expect(items).toEqual([1, 2]);
  });

  it('should handle error when updating items', async () => {
    page.fetchItems = vi.fn().mockRejectedValue(new Error('Fetch failed'));

    await expect(page.updateItems(1)).rejects.toThrow('Fetch failed');
    expect(page.items).toEqual([]);
    expect(page.loading).toBe(false);
  });

  it('should update list parameters correctly', async () => {
    const newList = {
      baseUrl: 'http://newurl.com',
      perPage: 20,
      params: { filter: 'new' },
    };

    await page.updateList(newList);

    expect(page.baseUrl).toBe('http://newurl.com');
    expect(page.perPage).toBe(20);
    expect(page.params).toEqual({ filter: 'new' });
  });

  it('should fetch all items', async () => {
    const mockResponse = (next) => ({
      data: { results: [1, 2], next: next ? 'http://next.com' : null },
    });

    page.fetchItems = vi.fn().mockResolvedValueOnce(mockResponse(false));

    const items = await page.fetchAll([], 1);

    expect(page.fetchItems).toHaveBeenCalledWith(1);
    expect(items).toEqual([1, 2]);
  });

  it('should handle error when fetching all items', async () => {
    page.fetchItems = vi.fn().mockRejectedValue(new Error('Fetch failed'));

    await expect(page.getAllItems()).rejects.toThrow('Fetch failed');
    expect(page.items).toEqual([]);
    expect(page.loading).toBe(false);
  });

  it('should fetch all items correctly', async () => {
    const mockResponse = (next) => ({
      data: { results: [1, 2], next: next ? 'http://next.com' : null },
    });
    page.fetchItems = vi.fn().mockResolvedValue(mockResponse(false));

    const items = await page.fetchAll([], 1);

    expect(page.fetchItems).toHaveBeenCalledWith(1);
    expect(items).toEqual([1, 2]);
  });

  it('should handle empty state correctly', () => {
    page.loading = false;
    page.items = [];

    expect(page.empty).toBe(true);

    page.items = [1];
    expect(page.empty).toBe(false);

    page.loading = true;
    expect(page.empty).toBe(false);
  });

  it('should use requestExternal client when token is provided', () => {
    page.token = 'mockToken';
    expect(page.pageRequest).toBe(requestExternal.$http('mockToken'));
  });

  it('should use default request client when no token is provided', () => {
    page.token = null;
    expect(page.pageRequest).toBe(request.$http);
  });

  it('should handle recursive fetchAll correctly', async () => {
    const mockResponse = (next) => ({
      data: { results: [1, 2], next: next ? 'http://next.com' : null },
    });

    page.fetchItems = vi.fn().mockResolvedValueOnce(mockResponse(false));

    const items = await page.fetchAll([], 1);

    expect(page.fetchItems).toHaveBeenCalledTimes(1);
    expect(items).toEqual([1, 2]);
  });

  it('should handle recursive null fetchAll correctly', async () => {
    const mockResponse = (next) => ({
      data: { results: [1, 2], next: next ? 'http://next.com' : null },
    });

    page.fetchItems = vi.fn().mockResolvedValueOnce(mockResponse(null));

    const items = await page.fetchAll([], 1);

    expect(page.fetchItems).toHaveBeenCalledTimes(1);
    expect(items).toEqual([1, 2]);
  });

  it('should mock QueryString.stringify correctly', () => {
    qs.stringify.mockReturnValue('mockedString');
    const result = qs.stringify({ test: 'value' });
    expect(result).toBe('mockedString');
  });

  it('should call fetchItems with correct page number', async () => {
    const mockResponse = { data: { results: [1, 2] } };
    page.fetchItems = vi.fn().mockResolvedValue(mockResponse);

    await page.updateItems(1);

    expect(page.fetchItems).toHaveBeenCalledWith(1);
  });
});
