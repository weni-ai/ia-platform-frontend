import { describe, it, expect, vi } from 'vitest';
import mutations from '@/store/user/mutations';
import TYPES from '@/store/types';

describe('@/store/user/mutations', () => {
  let state;

  beforeEach(() => {
    state = {
      profiles: {},
      nicknameAuthenticated: '',
      username: '',
    };
  });

  it('SET_PROFILE should correctly update the profiles object', () => {
    const profileData = { data: 'profile data', lastUpdate: '2024-01-01' };
    mutations[TYPES.SET_PROFILE](state, {
      nickname: 'john_doe',
      ...profileData,
    });

    expect(state.profiles['john_doe']).toEqual(profileData);
  });

  it('SET_PROFILE should merge with existing profiles', () => {
    state.profiles = {
      jane_doe: { data: 'existing profile data', lastUpdate: '2023-12-31' },
    };

    const profileData = { data: 'profile data', lastUpdate: '2024-01-01' };
    mutations[TYPES.SET_PROFILE](state, {
      nickname: 'john_doe',
      ...profileData,
    });

    expect(state.profiles['jane_doe']).toEqual({
      data: 'existing profile data',
      lastUpdate: '2023-12-31',
    });

    expect(state.profiles['john_doe']).toEqual(profileData);
  });

  it('SET_NICKNAME_AUTHENTICATED should correctly update nicknameAuthenticated', () => {
    mutations[TYPES.SET_NICKNAME_AUTHENTICATED](state, {
      nickname: 'john_doe',
    });

    expect(state.nicknameAuthenticated).toBe('john_doe');
  });

  it('SET_USERNAME should correctly update the username', () => {
    mutations[TYPES.SET_USERNAME](state, { username: 'johndoe' });

    expect(state.username).toBe('johndoe');
  });
});
