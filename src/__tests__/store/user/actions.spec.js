import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Sentry from '@sentry/vue';
import user from '@/api/user';
import actions from '@/store/user/actions';
import TYPES from '@/store/types';

vi.mock('@/api/user', () => ({
  default: {
    myProfile: vi.fn(),
    org_profile: vi.fn(),
    profile: vi.fn(),
    getPaymentHistory: vi.fn(),
    searchByOwner: vi.fn(),
    permissionRepositories: vi.fn(),
    getReports: vi.fn(),
    getMyProfileSchema: vi.fn(),
    updateMyProfile: vi.fn(),
    getChangePasswordSchema: vi.fn(),
    changePassword: vi.fn(),
    search: vi.fn(),
  },
}));

vi.mock('@sentry/vue', () => ({
  setUser: vi.fn(),
}));

describe('@/store/user/actions', () => {
  let commit, dispatch, getters;

  beforeEach(() => {
    commit = vi.fn();
    dispatch = vi.fn();
    getters = {
      authenticated: true,
      getProfileLastUpdate: vi.fn(() => Date.now() - 10000),
    };
    vi.clearAllMocks();
  });

  it('should update profile successfully', async () => {
    user.myProfile.mockResolvedValue({ data: { nickname: 'test-nickname' } });

    await actions.updateMyProfile({ commit, dispatch, getters });

    expect(commit).toHaveBeenCalledWith(TYPES.SET_PROFILE, {
      nickname: 'test-nickname',
      data: { nickname: 'test-nickname' },
      lastUpdate: expect.any(Number),
    });
    expect(commit).toHaveBeenCalledWith(TYPES.SET_NICKNAME_AUTHENTICATED, {
      nickname: 'test-nickname',
    });
  });

  it('should handle profile update failure', async () => {
    user.myProfile.mockRejectedValue(new Error('Failed'));

    await actions.updateMyProfile({ commit, dispatch, getters });

    expect(dispatch).toHaveBeenCalledWith('logout');
  });

  it('should handle profile if not autenticated', async () => {
    await actions.updateMyProfile({
      commit,
      dispatch,
      getters: {
        authenticated: false,
      },
    });

    expect(commit).toHaveBeenCalledWith(TYPES.SET_NICKNAME_AUTHENTICATED, {
      nickname: null,
    });
  });

  it('should update profile with new data if profile is outdated or forced', async () => {
    user.profile.mockResolvedValue({ data: { nickname: 'test-nickname' } });
    user.org_profile.mockResolvedValue({ data: { nickname: 'test-nickname' } });

    await actions.updateProfile(
      { commit, getters },
      { nickname: 'test-nickname', forced: true, isOrg: false },
    );

    expect(commit).toHaveBeenCalledWith(TYPES.SET_PROFILE, {
      nickname: 'test-nickname',
      lastUpdate: expect.any(Number),
    });
    expect(user.profile).toHaveBeenCalledWith('test-nickname');
  });

  it('should update profile with new data if profile is outdated or forced', async () => {
    user.profile.mockResolvedValue({ data: { nickname: 'test-nickname' } });
    user.org_profile.mockResolvedValue({ data: { nickname: 'test-nickname' } });

    await actions.updateProfile(
      { commit, getters },
      { nickname: 'test-nickname', forced: true, isOrg: false },
    );

    expect(commit).toHaveBeenCalledWith(TYPES.SET_PROFILE, {
      nickname: 'test-nickname',
      lastUpdate: expect.any(Number),
    });

    expect(user.profile).toHaveBeenCalledWith('test-nickname');

    await actions.updateProfile(
      { commit, getters },
      { nickname: 'test-nickname', forced: true, isOrg: true },
    );

    expect(commit).toHaveBeenCalledWith(TYPES.SET_PROFILE, {
      nickname: 'test-nickname',
      lastUpdate: expect.any(Number),
    });

    expect(user.org_profile).toHaveBeenCalledWith('test-nickname');
  });

  it('should set user name correctly', () => {
    actions.setUserName({ commit }, 'test-username');

    expect(commit).toHaveBeenCalledWith(TYPES.SET_USERNAME, {
      username: 'test-username',
    });
  });

  it('should retrieve payment history', () => {
    actions.getPaymentHistory({}, 10);

    expect(user.getPaymentHistory).toHaveBeenCalledWith(10);
  });

  it('should get repositories by owner', () => {
    actions.getRepositories(
      {},
      { limit: 10, offset: 0, owner_id: 'owner', next: 'next' },
    );

    expect(user.searchByOwner).toHaveBeenCalledWith(10, 0, 'owner', 'next');
  });

  it('should get contributing repositories', () => {
    actions.getContributingRepositories({});

    expect(user.permissionRepositories).toHaveBeenCalled();
  });

  it('should get user reports', () => {
    actions.getUserReports(
      {},
      { startDate: '2024-01-01', endDate: '2024-01-31', limit: 10 },
    );

    expect(user.getReports).toHaveBeenCalledWith(
      '2024-01-01',
      '2024-01-31',
      10,
    );
  });

  it('should get profile schema', async () => {
    user.getMyProfileSchema.mockResolvedValue({ schema: 'schema' });

    const result = await actions.getMyProfileSchema('test-nickname');

    expect(result).toEqual({ schema: 'schema' });
  });

  it('should patch profile correctly', () => {
    actions.patchMyProfile(
      {},
      {
        nickname: 'test-nickname',
        email: 'test@example.com',
        name: 'Test',
        locale: 'en',
        biography: 'Bio',
      },
    );

    expect(user.updateMyProfile).toHaveBeenCalledWith(
      'test-nickname',
      'test@example.com',
      'Test',
      'en',
      'Bio',
    );
  });

  it('should get change password schema', async () => {
    user.getChangePasswordSchema.mockResolvedValue({ schema: 'schema' });

    const result = await actions.getChangePasswordSchema();

    expect(result).toEqual({ schema: 'schema' });
  });

  it('should change password correctly', () => {
    actions.changePassword(
      {},
      { current_password: 'currentPass', password: 'newPass' },
    );

    expect(user.changePassword).toHaveBeenCalledWith('currentPass', 'newPass');
  });

  it('should search user correctly', () => {
    actions.searchUser({}, 'query');

    expect(user.search).toHaveBeenCalledWith('query');
  });

  it('should get my profile info and set user in Sentry', async () => {
    user.myProfile.mockResolvedValue({
      data: {
        nickname: 'test-nickname',
        name: 'Test Name',
        language: 'EN',
        locale: 'en-US',
      },
    });

    const result = await actions.getMyProfileInfo();

    expect(Sentry.setUser).toHaveBeenCalledWith({
      username: 'test-nickname',
      name: 'Test Name',
      language: 'EN',
      locale: 'en-US',
    });
    expect(result).toEqual({
      data: {
        nickname: 'test-nickname',
        name: 'Test Name',
        language: 'EN',
        locale: 'en-US',
      },
    });
  });
});
