import { describe, it, expect, vi, beforeEach } from 'vitest';
import auth from '@/api/auth';
import actions from '@/store/auth/actions';
import TYPES from '@/store/types';

vi.mock('@/api/auth', () => ({
  default: {
    getLoginSchema: vi.fn(),
    login: vi.fn(),
    getForgotPasswordSchema: vi.fn(),
    forgotPassword: vi.fn(),
    getResetPasswordSchema: vi.fn(),
    resetPassword: vi.fn(),
    getRegisterSchema: vi.fn(),
    register: vi.fn(),
  },
}));

describe('Auth Actions', () => {
  let commit, dispatch;

  beforeEach(() => {
    commit = vi.fn();
    dispatch = vi.fn();
  });

  it('getLoginSchema should call auth.getLoginSchema', async () => {
    auth.getLoginSchema.mockResolvedValue({ data: 'schema' });
    const response = await actions.getLoginSchema();
    expect(auth.getLoginSchema).toHaveBeenCalled();
    expect(response).toEqual({ data: 'schema' });
  });

  it('login should commit token and dispatch updateMyProfile', async () => {
    auth.login.mockResolvedValue({ data: { token: 'test-token' } });
    await actions.login(
      { commit, dispatch },
      { username: 'user', password: 'pass' },
    );
    expect(commit).toHaveBeenCalledWith(TYPES.SET_TOKEN, 'Token test-token');
    expect(dispatch).toHaveBeenCalledWith('updateMyProfile');
  });

  it('externalLogin should commit token if provided', async () => {
    await actions.externalLogin({ commit }, { token: 'external-token' });
    expect(commit).toHaveBeenCalledWith(TYPES.SET_TOKEN, 'external-token');
  });

  it('externalLogin should not commit if token is not provided', async () => {
    await actions.externalLogin({ commit }, { token: null });
    expect(commit).not.toHaveBeenCalled();
  });

  it('orgSelected should commit organization', async () => {
    await actions.orgSelected({ commit }, { org: 'org-id' });
    expect(commit).toHaveBeenCalledWith(TYPES.SET_ORG, 'org-id');
  });

  it('orgSelected should not commit if org is not provided', async () => {
    await actions.orgSelected({ commit }, { org: null });
    expect(commit).not.toHaveBeenCalled();
  });

  it('projectSelected should commit project', async () => {
    await actions.projectSelected({ commit }, { project: 'project-id' });
    expect(commit).toHaveBeenCalledWith(TYPES.SET_PROJECT, 'project-id');
  });

  it('projectSelected should not commit if project is not provided', async () => {
    await actions.projectSelected({ commit }, { project: null });
    expect(commit).not.toHaveBeenCalled();
  });

  it('retrieveAuthToken should commit token from localStorage', () => {
    const mockToken = 'localStorage-token';
    window.localStorage.setItem('authToken', mockToken);
    actions.retriveAuthToken({ commit });
    expect(commit).toHaveBeenCalledWith(TYPES.SET_TOKEN, mockToken);
  });

  it('logout should commit null token and dispatch updateMyProfile', () => {
    actions.logout({ commit, dispatch });
    expect(commit).toHaveBeenCalledWith(TYPES.SET_TOKEN, null);
    expect(dispatch).toHaveBeenCalledWith('updateMyProfile');
  });

  it('getForgotPasswordSchema should call auth.getForgotPasswordSchema', async () => {
    auth.getForgotPasswordSchema.mockResolvedValue({ data: 'forgot-schema' });
    const response = await actions.getForgotPasswordSchema();
    expect(auth.getForgotPasswordSchema).toHaveBeenCalled();
    expect(response).toEqual({ data: 'forgot-schema' });
  });

  it('forgotPassword should call auth.forgotPassword', async () => {
    await actions.forgotPassword({}, { email: 'test@example.com' });
    expect(auth.forgotPassword).toHaveBeenCalledWith('test@example.com');
  });

  it('getResetPasswordSchema should call auth.getResetPasswordSchema', async () => {
    auth.getResetPasswordSchema.mockResolvedValue({ data: 'reset-schema' });
    const response = await actions.getResetPasswordSchema(
      {},
      { nickname: 'test-nickname' },
    );
    expect(auth.getResetPasswordSchema).toHaveBeenCalledWith('test-nickname');
    expect(response).toEqual({ data: 'reset-schema' });
  });

  it('resetPassword should call auth.resetPassword', async () => {
    await actions.resetPassword(
      {},
      { nickname: 'test-nickname', token: 'reset-token', password: 'new-pass' },
    );
    expect(auth.resetPassword).toHaveBeenCalledWith(
      'test-nickname',
      'reset-token',
      'new-pass',
    );
  });

  it('getRegisterSchema should call auth.getRegisterSchema', async () => {
    auth.getRegisterSchema.mockResolvedValue({ data: 'register-schema' });
    const response = await actions.getRegisterSchema();
    expect(auth.getRegisterSchema).toHaveBeenCalled();
    expect(response).toEqual({ data: 'register-schema' });
  });

  it('register should call auth.register', async () => {
    await actions.register(
      {},
      {
        email: 'test@example.com',
        name: 'Test',
        nickname: 'Tester',
        password: 'password',
      },
    );
    expect(auth.register).toHaveBeenCalledWith(
      'test@example.com',
      'Test',
      'Tester',
      'password',
    );
  });
});
