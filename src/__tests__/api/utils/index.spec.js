import { describe, it, expect, vi } from 'vitest';
import index from '@/api/utils/index';
import Page from '@/api/utils/Page';

describe('api/utils/index.js', () => {
  it('should export Page module', () => {
    expect(index.Page).toBeDefined();
    expect(index.Page).toBe(Page);
  });

  it('should ensure Page is a class', () => {
    expect(typeof index.Page).toBe('function');
    expect(index.Page.prototype.constructor).toBe(Page);
  });

  it('should have Page class with expected methods', () => {
    const pageInstance = new index.Page('http://example.com', 10);

    expect(typeof pageInstance.updateItems).toBe('function');
    expect(typeof pageInstance.updateList).toBe('function');
    expect(typeof pageInstance.getAllItems).toBe('function');
    expect(typeof pageInstance.fetchItems).toBe('function');
    expect(typeof pageInstance.fetchAll).toBe('function');
    expect(typeof pageInstance.empty).toBe('boolean');
    expect(typeof pageInstance.pageRequest).toBe('function');
  });
});
