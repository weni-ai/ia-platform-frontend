import { describe, it, expect, vi, beforeEach } from 'vitest';
import actions from '@/store/integration/actions';
import TYPES from '@/store/integration/types';
import integration from '@/api/integration';

vi.mock('@/api/integration', () => ({
  default: {
    integrateRepository: vi.fn(),
    verifyIntegrateRepository: vi.fn(),
    disintegrateRepository: vi.fn(),
  },
}));

describe('store/integration/actions', () => {
  const mockStore = {
    commit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setIntegrationRepository', () => {
    it('should call integrateRepository with correct parameters', async () => {
      const params = {
        repository_version: 'v1',
        repository_uuid: 'uuid-123',
        name: 'test-repo',
        project_uuid: 'project-123',
        organization: 'org-123',
      };
      await actions.setIntegrationRepository(mockStore, params);
      expect(integration.integrateRepository).toHaveBeenCalledWith(
        'v1',
        'uuid-123',
        'test-repo',
        'project-123',
        'org-123',
      );
    });
  });

  describe('getIntegrationRepository', () => {
    it('should call verifyIntegrateRepository with correct parameters', async () => {
      const params = {
        repository_version: 'v1',
        repository_uuid: 'uuid-123',
        project_uuid: 'project-123',
        organization: 'org-123',
      };
      await actions.getIntegrationRepository(mockStore, params);
      expect(integration.verifyIntegrateRepository).toHaveBeenCalledWith(
        'v1',
        'uuid-123',
        'project-123',
        'org-123',
      );
    });
  });

  describe('removeIntegrationRepository', () => {
    it('should call disintegrateRepository with correct parameters', async () => {
      const params = {
        repository_version: 'v1',
        repository_uuid: 'uuid-123',
        name: 'test-repo',
        project_uuid: 'project-123',
        organization: 'org-123',
      };
      await actions.removeIntegrationRepository(mockStore, params);
      expect(integration.disintegrateRepository).toHaveBeenCalledWith(
        'v1',
        'uuid-123',
        'project-123',
        'org-123',
      );
    });
  });

  describe('updateIntegratedProjects', () => {
    it('should commit SET_UPDATE_PROJECTS', () => {
      actions.updateIntegratedProjects(mockStore);
      expect(mockStore.commit).toHaveBeenCalledWith(TYPES.SET_UPDATE_PROJECTS);
    });
  });
});
