import { describe, it, expect } from 'vitest';
import { handleChangeName } from '@/utils/changeNameUtils';

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key, params) => `${key}-${params?.value || ''}`),
    },
  },
}));

describe('utils/changeNameUtils.js', () => {
  describe('handleChangeName', () => {
    it('should return brain_on status on', () => {
      const row = {
        model_group: null,
        action_details: { brain_on: { new: 'true' } },
        created_by: 'user',
      };

      const result = handleChangeName(row);

      expect(result).toEqual({
        icon: 'settings',
        user: 'user',
        text: 'router.tunings.history.fields.brain-on-',
      });
    });

    it('should return brain_on status off', () => {
      const row = {
        model_group: null,
        action_details: { brain_on: { new: 'false' } },
        created_by: 'user',
      };

      const result = handleChangeName(row);

      expect(result).toEqual({
        icon: 'settings',
        user: 'user',
        text: 'router.tunings.history.fields.brain-off-',
      });
    });

    it('should return default values when row, model_group, action_type or action_details are missing', () => {
      const row = {
        model_group: null,
        action_details: {},
        created_by: 'user',
      };

      const result = handleChangeName(row);
      expect(result).toEqual({
        icon: 'article',
        user: '-',
        text: '-',
      });

      const result2 = handleChangeName({});
      expect(result2).toEqual({
        icon: 'article',
        user: '-',
        text: '-',
      });
    });

    it('should handle Action group with creation (C) action type', () => {
      const row = {
        model_group: 'Action',
        action_type: 'C',
        action_details: { new: 'new action' },
        created_by: 'user',
      };

      const result = handleChangeName(row);

      expect(result).toEqual({
        icon: 'bolt',
        user: 'user',
        text: 'router.tunings.history.fields.add-action-new action',
      });
    });

    it('should handle Action group with update (U) action type', () => {
      const row = {
        model_group: 'Action',
        action_type: 'U',
        action_details: {
          name: { new: 'new name', old: 'old name' },
          prompt: { new: 'new prompt', old: 'old prompt' },
        },
        created_by: 'user',
      };

      const result = handleChangeName(row);

      expect(result).toEqual({
        icon: 'bolt',
        user: 'user',
        text: 'router.tunings.history.fields.changes-2',
        groupText: [
          'router.tunings.history.fields.update-name-action-new name',
          'router.tunings.history.fields.update-prompt-action-new prompt',
        ],
      });
    });

    it('should handle Config group with update (U) action type', () => {
      const row = {
        model_group: 'Config',
        action_type: 'U',
        action_details: {},
        created_by: 'user',
      };

      const result = handleChangeName(row);

      expect(result).toEqual({
        icon: 'settings',
        user: 'user',
        text: 'router.tunings.history.fields.update-model-',
      });
    });

    it('should handle Content group with delete (D) action type', () => {
      const row = {
        model_group: 'Content',
        action_type: 'D',
        action_details: { new: 'deleted content' },
        created_by: 'user',
      };

      const result = handleChangeName(row);

      expect(result).toEqual({
        icon: 'article',
        user: 'user',
        text: 'router.tunings.history.fields.remove-content-deleted content',
      });
    });

    it('should handle Customization group with update (U) action type', () => {
      const row = {
        model_group: 'Customization',
        action_type: 'U',
        action_details: {
          name: { new: 'new customization', old: 'old customization' },
        },
        created_by: 'user',
      };

      const result = handleChangeName(row);

      expect(result).toEqual({
        icon: 'person',
        user: 'user',
        text: 'router.tunings.history.fields.update-name-new customization',
        groupText: [],
      });
    });

    it('should return Customization group with multiple updates (U) action type', () => {
      const row = {
        model_group: 'Customization',
        action_type: 'U',
        action_details: {
          name: { new: 'new name', old: 'old name' },
          goal: { new: 'new goal', old: 'old goal' },
        },
        created_by: 'user',
      };

      const result = handleChangeName(row);

      expect(result).toEqual({
        icon: 'person',
        user: 'user',
        text: 'router.tunings.history.fields.changes-2',
        groupText: [
          'router.tunings.history.fields.update-name-new name',
          'router.tunings.history.fields.update-goal-new goal',
        ],
      });
    });
  });
});
