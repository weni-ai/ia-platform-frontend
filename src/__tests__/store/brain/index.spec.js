import { describe, it, expect, vi, beforeEach } from 'vitest';
import store from '@/store/brain/index.js';
import nexusaiAPI from '@/api/nexusaiAPI.js';
import { createPinia, setActivePinia } from 'pinia';
import { useBrainCustomizationStore } from '@/store/BrainCustomization';

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
  let brainCustomizationStore;
  let brainCustomizationStoreValidate;
  let brainCustomizationStoreSave;

  beforeEach(() => {
    vi.clearAllMocks();

    setActivePinia(createPinia());

    brainCustomizationStore = useBrainCustomizationStore();

    brainCustomizationStoreValidate = vi.spyOn(
      brainCustomizationStore,
      'validate',
    );
    brainCustomizationStoreSave = vi.spyOn(brainCustomizationStore, 'save');
  });

  describe('getters', () => {
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
      const state = {};
      const getters = {
        hasBrainTuningsChanged: false,
        hasBrainContentTextChanged: false,
      };
      expect(store.getters.isBrainSaveButtonDisabled(state, getters)).toBe(
        true,
      );
    });

    it('should return false if the save button', () => {
      const state = {};
      const getters = {
        hasBrainTuningsChanged: true,
      };
      expect(store.getters.isBrainSaveButtonDisabled(state, getters)).toBe(
        false,
      );
    });

    it('should return false if brain content text has not changed', () => {
      const state = {
        contentText: { current: 'text', old: 'text' },
      };
      expect(store.getters.hasBrainContentTextChanged(state)).toBe(false);
    });
  });

  describe('actions', () => {
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
      brainCustomizationStore.name.current = 'Changed';
      brainCustomizationStore.role.current = 'Changed';
      brainCustomizationStore.personality.current = 'Changed';
      brainCustomizationStore.goal.current = 'Changed';
      const dispatch = vi.fn().mockResolvedValue([]);
      await store.actions.saveBrainChanges({
        state: { isSavingChanges: false },
        getters: store.getters,
        rootState,
        dispatch,
      });

      expect(brainCustomizationStoreValidate).toHaveBeenCalled();
      expect(brainCustomizationStoreSave).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith('saveBrainTunings');
      expect(dispatch).toHaveBeenCalledWith('saveBrainContentText');
    });
  });

  describe('mutations', () => {
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

    it('should update tuning value correctly', () => {
      const state = { tunings: { temperature: 0.7 } };
      store.mutations.updateTuning(state, { name: 'temperature', value: 0.9 });
      expect(state.tunings.temperature).toBe(0.9);
    });
  });
});
