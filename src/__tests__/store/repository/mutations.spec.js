import { describe, it, expect } from 'vitest';
import mutations from '@/store/repository/mutations';
import TYPES from '@/store/repository/types';

describe('@/store/repository/mutations', () => {
  let state;

  beforeEach(() => {
    state = {
      relatedUuid: {},
      selectedRepository: null,
      updateVersions: null,
      updateRepository: null,
      evaluateResultId: null,
      evaluateResultVersion: null,
      evaluateLanguage: null,
      requirements: null,
      repositoryVersion: null,
      repositoryVersionName: null,
      repositoryIsTraining: null,
    };
  });

  it('SET_REPOSITORY_RELATED_UUID should correctly set relatedUuid', () => {
    const payload = { ownerNickname: 'owner', slug: 'slug', uuid: 'uuid' };
    mutations[TYPES.SET_REPOSITORY_RELATED_UUID](state, payload);

    expect(state.relatedUuid).toEqual({
      'owner/slug/': 'uuid',
    });
  });

  it('setRepository should set selectedRepository', () => {
    const value = 'repository';
    mutations.setRepository(state, value);

    expect(state.selectedRepository).toBe(value);
  });

  it('updateVersionsState should set updateVersions', () => {
    const value = 'versionsState';
    mutations.updateVersionsState(state, value);

    expect(state.updateVersions).toBe(value);
  });

  it('updateRepository should set updateRepository', () => {
    const value = 'repositoryUpdate';
    mutations.updateRepository(state, value);

    expect(state.updateRepository).toBe(value);
  });

  it('updateEvaluateResultId should set evaluateResultId and evaluateResultVersion', () => {
    const payload = { id: 'resultId', version: 'resultVersion' };
    mutations.updateEvaluateResultId(state, payload);

    expect(state.evaluateResultId).toBe(payload.id);
    expect(state.evaluateResultVersion).toBe(payload.version);
  });

  it('updateEvaluateLanguage should set evaluateLanguage', () => {
    const value = 'language';
    mutations.updateEvaluateLanguage(state, value);

    expect(state.evaluateLanguage).toBe(value);
  });

  it('updateRequirements should set requirements', () => {
    const value = 'requirements';
    mutations.updateRequirements(state, value);

    expect(state.requirements).toBe(value);
  });

  it('setRepositoryVersion should set repositoryVersion and repositoryVersionName if version id is different', () => {
    const payload = {
      version: { id: 'newId', name: 'newName' },
      repositoryUUID: 'uuid',
    };
    mutations.setRepositoryVersion(state, payload);

    expect(state.repositoryVersion).toEqual({
      id: 'newId',
      repositoryUUID: 'uuid',
    });
    expect(state.repositoryVersionName).toBe('newName');
  });

  it('setRepositoryVersion should return early if value or version is not provided', () => {
    mutations.setRepositoryVersion(state, null);
    expect(state.repositoryVersion).toBeNull();
    expect(state.repositoryVersionName).toBeNull();
  });

  it('resetVersion should set repositoryVersion to null', () => {
    state.repositoryVersion = { id: 'id' };
    mutations.resetVersion(state);

    expect(state.repositoryVersion).toBeNull();
  });

  it('updateRepositoryTraining should set repositoryIsTraining', () => {
    const value = true;
    mutations.updateRepositoryTraining(state, value);

    expect(state.repositoryIsTraining).toBe(value);
  });
});
