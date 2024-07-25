import { describe, it, expect, beforeEach } from 'vitest';
import mutations from '@/store/auth/mutations';
import TYPES from '@/store/types';

describe('Auth Mutations', () => {
  let state;

  beforeEach(() => {
    state = {
      token: null,
      org: null,
      project: null,
    };

    global.localStorage = {
      setItem: vi.fn(),
      removeItem: vi.fn(),
      getItem: vi.fn(),
    };
  });

  describe('SET_TOKEN', () => {
    it('should set the token in state', () => {
      mutations[TYPES.SET_TOKEN](state, 'test-token');
      expect(state.token).toBe('test-token');
    });

    it('should set the token in localStorage when token is provided', () => {
      mutations[TYPES.SET_TOKEN](state, 'test-token');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'authToken',
        'test-token',
      );
    });

    it('should remove the token from localStorage when token is null', () => {
      mutations[TYPES.SET_TOKEN](state, null);
      expect(state.token).toBe(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('should handle localStorage being unavailable', () => {
      global.localStorage = undefined;
      mutations[TYPES.SET_TOKEN](state, 'test-token');
      expect(state.token).toBe('test-token');
    });
  });

  describe('SET_ORG', () => {
    it('should set the org in state', () => {
      mutations[TYPES.SET_ORG](state, 'test-org');
      expect(state.org).toBe('test-org');
    });
  });

  describe('SET_PROJECT', () => {
    it('should set the project in state', () => {
      mutations[TYPES.SET_PROJECT](state, 'test-project');
      expect(state.project).toBe('test-project');
    });
  });
});
