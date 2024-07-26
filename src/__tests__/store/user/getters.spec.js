import { describe, it, expect } from 'vitest';
import getters from '@/store/user/getters';

describe('@/store/user/getters', () => {
  const state = {
    profiles: {
      testUser: {
        data: { name: 'Test User', nickname: 'testUser' },
        lastUpdate: 1234567890,
      },
    },
    nicknameAuthenticated: 'testUser',
  };

  it('myProfile should return the profile data for the authenticated nickname', () => {
    const result = getters.myProfile(state);
    expect(result).toEqual({ name: 'Test User', nickname: 'testUser' });
  });

  it('myProfile should return an empty object if no profile data is available', () => {
    const result = getters.myProfile({
      ...state,
      nicknameAuthenticated: 'nonExistentUser',
    });
    expect(result).toEqual({});
  });

  it('getProfile should return the profile data for a given nickname', () => {
    const result = getters.getProfile(state)('testUser');
    expect(result).toEqual({ name: 'Test User', nickname: 'testUser' });
  });

  it('getProfile should return default data if no profile is found for the given nickname', () => {
    const result = getters.getProfile(state)('nonExistentUser');
    expect(result).toEqual({
      name: 'nonExistentUser',
      nickname: 'nonExistentUser',
    });
  });

  it('getProfileLastUpdate should return the last update timestamp for a given nickname', () => {
    const result = getters.getProfileLastUpdate(state)('testUser');
    expect(result).toBe(1234567890);
  });

  it('getProfileLastUpdate should return 0 if no last update is available for the given nickname', () => {
    const result = getters.getProfileLastUpdate(state)('nonExistentUser');
    expect(result).toBe(0);
  });
});
