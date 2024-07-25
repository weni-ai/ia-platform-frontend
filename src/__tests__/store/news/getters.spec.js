import { describe, it, expect, beforeEach } from 'vitest';
import getters from '@/store/news/getters';

describe('store/news/getters', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return the last version seen from localStorage', () => {
    localStorage.setItem('lastVersionSeen', 'v1.0.0');

    const result = getters.lastVersionSeen();

    expect(result).toBe('v1.0.0');
  });

  it('should return null if lastVersionSeen is not set in localStorage', () => {
    localStorage.removeItem('lastVersionSeen');

    const result = getters.lastVersionSeen();

    expect(result).toBeNull();
  });
});
