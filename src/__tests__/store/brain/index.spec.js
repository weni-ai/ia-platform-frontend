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

vi.mock('@/store/brain/models.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    models: [
      {
        name: 'WeniGPT',
        fields: [],
      },
      {
        name: 'ChatGPT',
        fields: [],
      },
    ],
  };
});

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

    it('should return the correct brain tunings fields', () => {
      const state = {
        tunings: { model: 'WeniGPT' },
        tuningsOld: { model: 'TestGPT' },
      };
      const fields = store.getters.brainTuningsFields(state);
      expect(fields).toHaveLength(1);
      expect(fields[0].name).toBe('model');
      expect(fields[0].value).toBe('WeniGPT');
      expect(fields[0].previousValue).toBe('TestGPT');
    });

    it('should return false if brain tunings have not changed', () => {
      store.getters.brainTuningsFields = [
        { value: 'value', previousValue: 'value' },
      ];
      const result = store.getters.hasBrainTuningsChanged({}, store.getters);
      expect(result).toBe(false);
    });

    it('should return true if brain tunings have changed', () => {
      store.getters.brainTuningsFields = [
        { value: 'value', previousValue: 'oldValue' },
      ];
      const result = store.getters.hasBrainTuningsChanged({}, store.getters);
      expect(result).toBe(true);
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

    it('should return false if the save button', () => {
      const state = {
        customizationErrorRequiredFields: {
          name: false,
        },
      };
      const getters = {
        hasBrainCustomizationChanged: true,
      };
      expect(store.getters.isBrainSaveButtonDisabled(state, getters)).toBe(
        false,
      );
    });

    it('should return true if agent properties have changed', () => {
      const state = {
        agent: {
          name: { current: 'new-name', old: 'old-name' },
          role: { current: 'new-role', old: 'old-role' },
          goal: { current: 'new-goal', old: 'old-goal' },
          personality: { current: 'new-personality', old: 'old-personality' },
        },
        instructions: { current: [], old: [] },
      };
      expect(store.getters.hasBrainCustomizationChanged(state)).toBe(true);
    });

    it('should return false if no agent properties or instructions have changed', () => {
      const state = {
        agent: {
          name: { current: 'name', old: 'name' },
          role: { current: 'role', old: 'role' },
          goal: { current: 'goal', old: 'goal' },
          personality: { current: 'personality', old: 'personality' },
        },
        instructions: { current: [], old: [] },
      };
      expect(store.getters.hasBrainCustomizationChanged(state)).toBe(false);
    });

    it('should return false if brain content text has not changed', () => {
      const state = {
        contentText: { current: 'text', old: 'text' },
      };
      expect(store.getters.hasBrainContentTextChanged(state)).toBe(false);
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

    it('should load brain customization and commit values if is agent === null', async () => {
      nexusaiAPI.router.customization.read.mockResolvedValue({
        data: { agent: null, instructions: [] },
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
        {
          agent: { name: '', role: '', goal: '', personality: '' },
          instructions: [],
        },
      );
    });

    it('should load brain tunings with tuningsStatus !== waitingToLoad is true', async () => {
      const commit = vi.fn();
      const result = await store.actions.loadBrainTunings({
        commit,
        state: {
          customizationStatus: 'notToLoad',
        },
        rootState,
      });
      expect(result).toBe(undefined);
    });

    it('should load brain tunings customization and commit values', async () => {
      nexusaiAPI.router.tunings.read.mockResolvedValue({
        data: { setup: { name: 'test' } },
      });
      const commit = vi.fn();

      await store.actions.loadBrainTunings({
        commit,
        state: {
          tuningsStatus: 'waitingToLoad',
        },
        rootState: {
          Auth: {
            connectProjectUuid: 'fakeuuuid',
          },
        },
      });

      expect(commit).toHaveBeenCalledWith('setBrainTuningsInitialValues', {
        setup: { name: 'test' },
      });
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

    it('should return undefined in loadBrainCustomization action', async () => {
      const commit = vi.fn();
      const result = await store.actions.loadBrainCustomization({
        commit,
        state: {
          customizationStatus: 'notToLoad',
        },
        rootState,
      });
      expect(result).toBe(undefined);
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
    describe('actions', () => {
      it('should set error state when failing to load brain customization', async () => {
        nexusaiAPI.router.customization.read.mockRejectedValue(
          new Error('Failed'),
        );
        const commit = vi.fn();
        await store.actions.loadBrainCustomization({
          commit,
          state: { customizationStatus: 'waitingToLoad' },
          rootState,
        });
        expect(rootState.alert.type).toBe('error');
        expect(rootState.alert.text).toBe(
          i18n.global.t('customization.invalid_get_data'),
        );
      });

      it('should update the status to "loaded" after loading brain customization', async () => {
        nexusaiAPI.router.customization.read.mockResolvedValue({
          data: { agent: { name: 'name' }, instructions: [] },
        });
        const commit = vi.fn();
        const state = { customizationStatus: 'waitingToLoad' };
        await store.actions.loadBrainCustomization({
          commit,
          state,
          rootState,
        });
        expect(state.customizationStatus).toBe('loaded');
      });

      it('should validate brain customization and set error fields', () => {
        const state = {
          agent: {
            name: { current: '' },
            role: { current: '' },
            goal: { current: '' },
          },
          customizationErrorRequiredFields: {
            name: false,
            role: false,
            goal: false,
          },
        };
        try {
          store.actions.validateBrainCustomization({ state });
        } catch (e) {
          expect(e.tab).toBe('personalization');
        }
        expect(state.customizationErrorRequiredFields.name).toBe(true);
      });

      it('should set tabsWithError when brain customization validation fails', async () => {
        store.getters.hasBrainCustomizationChanged = true;
        const dispatch = vi.fn().mockRejectedValue({ tab: 'personalization' });
        const state = { tabsWithError: null };
        await store.actions.saveBrainChanges({
          state,
          getters: store.getters,
          rootState,
          dispatch,
        });
        expect(state.tabsWithError).toEqual(['personalization']);
      });
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

    it('should set brain tunings initial values with especial values', () => {
      const state = { tunings: {}, tuningsOld: {} };
      store.mutations.setBrainTuningsInitialValues(state, {
        model: 'model',
        setup: { temperature: '0.9' },
      });
      expect(state.tunings.model).toBe('model');
      expect(state.tuningsOld.model).toBe('model');
      expect(state.tunings.temperature).toBe(0.9);
      expect(state.tuningsOld.temperature).toBe(0.9);
    });

    it('should set brain tunings initial values with especial values', () => {
      const state = { tunings: {}, tuningsOld: {} };
      store.mutations.setBrainTuningsInitialValues(state, {
        model: 'model',
        setup: { temperature: '0.9' },
      });
      expect(state.tunings.model).toBe('model');
      expect(state.tuningsOld.model).toBe('model');
      expect(state.tunings.temperature).toBe(0.9);
      expect(state.tuningsOld.temperature).toBe(0.9);
    });

    it('should set brain tunings initial values with version and WeniGpt', () => {
      const state = { tunings: {}, tuningsOld: {} };
      store.mutations.setBrainTuningsInitialValues(state, {
        model: 'WeniGPT',
        setup: { version: 'version' },
      });

      expect(state.tunings.model).toBe('WeniGPT');
      expect(state.tuningsOld.model).toBe('WeniGPT');
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
    it('should set brain customization initial values correctly', () => {
      const state = {
        agent: {
          name: { current: '', old: '' },
          role: { current: '', old: '' },
          goal: { current: '', old: '' },
          personality: { current: '', old: '' },
        },
        instructions: { current: [], old: [] },
      };
      const data = {
        agent: {
          name: 'new-name',
          role: 'new-role',
          goal: 'new-goal',
          personality: 'new-personality',
        },
        instructions: [],
      };
      store.mutations.setBrainCustomizationInitialValues(state, data);
      expect(state.agent.name.current).toBe('new-name');
      expect(state.agent.role.current).toBe('new-role');
      expect(state.agent.goal.current).toBe('new-goal');
      expect(state.agent.personality.current).toBe('new-personality');
    });

    it('should update tuning value correctly', () => {
      const state = { tunings: { temperature: 0.7 } };
      store.mutations.updateTuning(state, { name: 'temperature', value: 0.9 });
      expect(state.tunings.temperature).toBe(0.9);
    });
  });
});
