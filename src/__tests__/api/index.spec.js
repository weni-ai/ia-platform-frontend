import { describe, it, expect } from 'vitest';
import api from '@/api';

vi.mock('@/api/auth', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

vi.mock('@/api/repository', () => ({
  default: {
    getRepository: vi.fn(),
    createRepository: vi.fn(),
    updateRepository: vi.fn(),
  },
}));

describe('api/index.js', () => {
  it('should export auth module', () => {
    expect(api.auth).toBeDefined();
    expect(typeof api.auth).toBe('object');
  });

  it('should export repository module', () => {
    expect(api.repository).toBeDefined();
    expect(typeof api.repository).toBe('object');
  });

  it('auth module should have specific functions', () => {
    expect(api.auth.login).toBeDefined();
    expect(api.auth.logout).toBeDefined();
    expect(api.auth.isAuthenticated).toBeDefined();
  });

  it('repository module should have specific functions', () => {
    expect(api.repository.getRepository).toBeDefined();
    expect(api.repository.createRepository).toBeDefined();
    expect(api.repository.updateRepository).toBeDefined();
  });
});
