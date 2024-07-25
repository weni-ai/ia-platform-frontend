import { describe, it, expect } from 'vitest';
import getters from '@/store/auth/getters';

describe('Auth Getters', () => {
  const state = {
    token: 'test-token',
    org: 'test-org',
    project: 'test-project',
  };

  it('authToken should return the token from the state', () => {
    const result = getters.authToken(state);
    expect(result).toBe('test-token');
  });

  it('authenticated should return true if token exists', () => {
    const result = getters.authenticated(state);
    expect(result).toBe(true);
  });

  it('authenticated should return false if token does not exist', () => {
    const result = getters.authenticated({ ...state, token: null });
    expect(result).toBe(false);
  });

  it('getOrgSelected should return the selected organization from the state', () => {
    const result = getters.getOrgSelected(state);
    expect(result).toBe('test-org');
  });

  it('getOrgSelected should return undefined if org is not set', () => {
    const result = getters.getOrgSelected({ ...state, org: undefined });
    expect(result).toBeUndefined();
  });

  it('getProjectSelected should return the selected project from the state', () => {
    const result = getters.getProjectSelected(state);
    expect(result).toBe('test-project');
  });

  it('getProjectSelected should return undefined if project is not set', () => {
    const result = getters.getProjectSelected({ ...state, project: undefined });
    expect(result).toBeUndefined();
  });
});
