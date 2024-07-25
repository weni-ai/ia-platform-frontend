import { describe, it, expect, vi, beforeEach } from 'vitest';
import getters from '@/store/repository/getters';

global.runtimeVariables = {
  get: vi.fn(() => 'enabled'),
};

describe('@/store/repository/getters', () => {
  const state = {
    relatedUuid: '123-abc',
    updateRepository: true,
    selectedRepository: 'test-repo',
    updateVersions: false,
    requirements: ['req1', 'req2'],
    repositoryVersion: {
      id: 'v1',
      repositoryUUID: 'repo-uuid',
    },
    repositoryVersionName: 'Version 1.0',
    repositoryIsTraining: true,
  };

  it('relatedUuid should return the related UUID from the state', () => {
    const result = getters.relatedUuid(state);
    expect(result).toBe('123-abc');
  });

  it('getUpdateRepositoryState should return the update repository state from the state', () => {
    const result = getters.getUpdateRepositoryState(state);
    expect(result).toBe(true);
  });

  it('getCurrentRepository should return the selected repository from the state', () => {
    const result = getters.getCurrentRepository(state);
    expect(result).toBe('test-repo');
  });

  it('getUpdateVersionsState should return the update versions state from the state', () => {
    const result = getters.getUpdateVersionsState(state);
    expect(result).toBe(false);
  });

  it('getRequirements should return the requirements from the state', () => {
    const result = getters.getRequirements(state);
    expect(result).toEqual(['req1', 'req2']);
  });

  it('getSelectedVersion should return the repository version ID from the state', () => {
    const result = getters.getSelectedVersion(state);
    expect(result).toBe('v1');
  });

  it('getSelectedVersion should return null if repositoryVersion is not set', () => {
    const result = getters.getSelectedVersion({
      ...state,
      repositoryVersion: null,
    });
    expect(result).toBeNull();
  });

  it('getSelectedVersionRepository should return the repository UUID from the state', () => {
    const result = getters.getSelectedVersionRepository(state);
    expect(result).toBe('repo-uuid');
  });

  it('getSelectedVersionRepository should return null if repositoryVersion is not set', () => {
    const result = getters.getSelectedVersionRepository({
      ...state,
      repositoryVersion: null,
    });
    expect(result).toBeNull();
  });

  it('getNameVersion should return the repository version name from the state', () => {
    const result = getters.getNameVersion(state);
    expect(result).toBe('Version 1.0');
  });

  it('getCheckRepositoryTrain should return the repository training state from the state', () => {
    const result = getters.getCheckRepositoryTrain(state);
    expect(result).toBe(true);
  });

  it('versionEnabled should return the value from runtimeVariables', () => {
    const result = getters.versionEnabled();
    expect(result).toBe('enabled');
    expect(runtimeVariables.get).toHaveBeenCalledWith('VITE_VERSION_ENABLED');
  });
});
