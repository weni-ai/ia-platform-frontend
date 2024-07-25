import { describe, it, expect, vi, beforeEach } from 'vitest';
import store from '@/store/brain/index.js';
import nexusaiAPI from '@/api/nexusaiAPI.js';
import i18n from '@/utils/plugins/i18n';

vi.mock('@/api/nexusaiAPI.js', () => ({
  default: {
    router: {
      customization: {
        read: vi.fn(),
        edit: vi.fn(),
      },
      tunings: {
        read: vi.fn(),
        edit: vi.fn(),
      },
    },
    intelligences: {
      contentBases: {
        texts: {
          edit: vi.fn(),
          create: vi.fn(),
        },
      },
    },
  },
}));

vi.mock('@/utils', () => ({
  WENIGPT_OPTIONS: [{ name: 'default', model: 'default-model' }],
}));

vi.mock('@/store/index.js', () => ({
  default: {
    watch: vi.fn(),
  },
}));

const rootState = {
  Auth: {
    connectProjectUuid: 'test-project-uuid',
  },
  router: {
    contentBaseUuid: 'test-content-base-uuid',
  },
};

describe('store/brain/index.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getters', () => {
    it('should return true if brain customization has changed', () => {
      const state = {
        agent: {
          name: { current: 'new-name', old: 'old-name' },
          role: { current: 'role', old: 'role' },
          goal: { current: 'goal', old: 'goal' },
          personality: { current: 'personality', old: 'personality' },
        },
        instructions: {
          current: [{ instruction: 'new-instruction' }],
          old: [{ instruction: 'old-instruction' }],
        },
      };
      expect(store.getters.hasBrainCustomizationChanged(state)).toBe(true);
    });

    it('should return false if brain tunings have not changed', () => {
      store.getters.brainTuningsFields = [
        { value: 'value', previousValue: 'value' },
      ];
      const result = store.getters.hasBrainTuningsChanged({}, store.getters);
      expect(result).toBe(false);
    });

    it('should return true if brain content text has changed', () => {
      const state = {
        contentText: { current: 'new-text', old: 'old-text' },
      };
      expect(store.getters.hasBrainContentTextChanged(state)).toBe(true);
    });

    it('should return true if the save button is disabled due to error fields', () => {
      const state = {
        customizationErrorRequiredFields: {
          name: true,
          role: false,
          goal: false,
        },
      };
      const getters = {
        hasBrainCustomizationChanged: false,
        hasBrainTuningsChanged: false,
        hasBrainContentTextChanged: false,
      };
      expect(store.getters.isBrainSaveButtonDisabled(state, getters)).toBe(
        true,
      );
    });
  });

  describe('actions', () => {
    it('should load brain customization and commit values', async () => {
      nexusaiAPI.router.customization.read.mockResolvedValue({
        data: { agent: { name: 'name' }, instructions: [] },
      });
      const commit = vi.fn();
      await store.actions.loadBrainCustomization({
        commit,
        state: {
          customizationStatus: 'waitingToLoad',
        },
        rootState,
      });
      expect(commit).toHaveBeenCalledWith(
        'setBrainCustomizationInitialValues',
        { agent: { name: 'name' }, instructions: [] },
      );
    });

    it('should handle errors in loadBrainCustomization action', async () => {
      nexusaiAPI.router.customization.read.mockRejectedValue(
        new Error('Failed'),
      );
      const commit = vi.fn();
      await store.actions.loadBrainCustomization({
        commit,
        state: {
          customizationStatus: 'waitingToLoad',
        },
        rootState,
      });
      expect(rootState.alert).toEqual({
        type: 'error',
        text: i18n.global.t('customization.invalid_get_data'),
      });
    });

    it('should save brain customization and commit values', async () => {
      const commit = vi.fn();
      const data = { agent: { name: 'name' }, instructions: [] };
      nexusaiAPI.router.customization.edit.mockResolvedValue({ data });
      await store.actions.saveBrainCustomization({
        commit,
        state: {
          agent: { name: { current: 'name' } },
          instructions: { current: [] },
        },
        rootState,
      });
      expect(commit).toHaveBeenCalledWith(
        'setBrainCustomizationInitialValues',
        data,
      );
    });

    it('should save brain content text when UUID exists', async () => {
      const commit = vi.fn();
      nexusaiAPI.intelligences.contentBases.texts.edit.mockResolvedValue({
        data: { uuid: 'uuid', text: 'text' },
      });
      await store.actions.saveBrainContentText({
        commit,
        state: { contentText: { uuid: 'uuid', current: 'new-text' } },
        rootState,
      });
      expect(commit).toHaveBeenCalledWith('setBrainContentTextInitialValues', {
        uuid: 'uuid',
        text: 'text',
      });
    });

    it('should create brain content text when UUID does not exist', async () => {
      const commit = vi.fn();
      nexusaiAPI.intelligences.contentBases.texts.create.mockResolvedValue({
        data: { uuid: 'new-uuid', text: 'new-text' },
      });
      await store.actions.saveBrainContentText({
        commit,
        state: { contentText: { current: 'new-text' } },
        rootState,
      });
      expect(commit).toHaveBeenCalledWith('setBrainContentTextInitialValues', {
        uuid: 'new-uuid',
        text: 'new-text',
      });
    });

    it('should save brain tunings and handle fields change', async () => {
      const commit = vi.fn();
      const fields = [{ name: 'model', value: 'new-model', type: 'text' }];
      store.getters.brainTuningsFields = fields;
      nexusaiAPI.router.tunings.edit.mockResolvedValue({ data: {} });
      window.brainPreviewAddMessage = vi.fn();
      await store.actions.saveBrainTunings({
        getters: store.getters,
        commit,
        rootState,
      });
      expect(commit).toHaveBeenCalledWith('setBrainTuningsInitialValues', {});
      expect(window.brainPreviewAddMessage).toHaveBeenCalled();
    });

    it('should save brain changes and handle errors', async () => {
      store.getters.hasBrainCustomizationChanged = true;
      store.getters.hasBrainTuningsChanged = true;
      store.getters.hasBrainContentTextChanged = true;
      const dispatch = vi.fn().mockResolvedValue([]);
      await store.actions.saveBrainChanges({
        state: { isSavingChanges: false },
        getters: store.getters,
        rootState,
        dispatch,
      });
      expect(dispatch).toHaveBeenCalledWith('validateBrainCustomization');
      expect(dispatch).toHaveBeenCalledWith('saveBrainCustomization');
      expect(dispatch).toHaveBeenCalledWith('saveBrainTunings');
      expect(dispatch).toHaveBeenCalledWith('saveBrainContentText');
    });
  });

  describe('mutations', () => {
    it('should set brain customization initial values', () => {
      const state = {
        agent: { name: { old: '', current: '' } },
        instructions: {
          current: [{ instruction: '' }],
          old: [{ instruction: '' }],
        },
      };
      store.mutations.setBrainCustomizationInitialValues(state, {
        agent: { name: 'new-name' },
        instructions: [],
      });

      expect(state.agent.name.current).toBe('new-name');
      expect(state.agent.name.old).toBe('new-name');
      expect(state.instructions.current).toEqual([{ instruction: '' }]);
      expect(state.instructions.old).toEqual([{ instruction: '' }]);
    });

    it('should set brain tunings initial values', () => {
      const state = { tunings: {}, tuningsOld: {} };
      store.mutations.setBrainTuningsInitialValues(state, {
        model: 'model',
        setup: { version: 'version' },
      });
      expect(state.tunings.model).toBe('model');
      expect(state.tuningsOld.model).toBe('model');
    });

    it('should set brain content text initial values', () => {
      const state = { contentText: { uuid: '', current: '', old: '' } };
      store.mutations.setBrainContentTextInitialValues(state, {
        uuid: 'uuid',
        text: 'text',
      });
      expect(state.contentText.uuid).toBe('uuid');
      expect(state.contentText.current).toBe('text');
      expect(state.contentText.old).toBe('text');
    });

    it('should update tuning value', () => {
      const state = { tunings: {} };
      store.mutations.updateTuning(state, { name: 'temperature', value: 0.5 });
      expect(state.tunings.temperature).toBe(0.5);
    });
  });
});
