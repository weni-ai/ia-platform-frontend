import { describe, it, expect, vi, beforeEach } from 'vitest';
import actions from '@/store/news/actions';

describe('store/news/actions.js', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should set the lastVersionSeen in localStorage', () => {
    const version = '1.0.0';

    actions.setLastVersionSeen(null, version);

    expect(localStorage.getItem('lastVersionSeen')).toBe(version);
  });

  it('should handle setting the lastVersionSeen with different versions', () => {
    const version1 = '1.0.0';
    const version2 = '2.0.0';

    actions.setLastVersionSeen(null, version1);
    expect(localStorage.getItem('lastVersionSeen')).toBe(version1);

    actions.setLastVersionSeen(null, version2);
    expect(localStorage.getItem('lastVersionSeen')).toBe(version2);
  });

  it('should handle setting the lastVersionSeen with empty string', () => {
    const version = '';

    actions.setLastVersionSeen(null, version);

    expect(localStorage.getItem('lastVersionSeen')).toBe(version);
  });
});
