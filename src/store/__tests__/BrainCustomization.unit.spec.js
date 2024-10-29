import nexusaiAPI from '@/api/nexusaiAPI';
import { useBrainCustomizationStore } from '@/store/BrainCustomization';
import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeAll, beforeEach, vi } from 'vitest';

vi.mock('@/store', () => ({
  default: {
    state: {
      Auth: { connectProjectUuid: '1234' },
    },
  },
}));

const customizationRead = vi
  .spyOn(nexusaiAPI.router.customization, 'read')
  .mockResolvedValue({
    data: {
      agent: {
        name: 'Initial Name',
        role: 'Initial Role',
        personality: 'Initial Personality',
        goal: 'Initial Goal',
      },

      instructions: [{ id: '1', instruction: 'First Instruction' }],
    },
  });

const customizationInstructionDelete = vi
  .spyOn(nexusaiAPI.router.customization, 'delete')
  .mockResolvedValue();

describe('BrainCustomization', () => {
  let brainCustomizationStore;

  beforeEach(() => {
    setActivePinia(createPinia());

    brainCustomizationStore = useBrainCustomizationStore();
  });

  it('status should be null initially', () => {
    expect(brainCustomizationStore.status).toBe(null);
  });

  describe('when load is called', () => {
    it('status should be loading', () => {
      brainCustomizationStore.load();
      brainCustomizationStore.load();

      expect(brainCustomizationStore.status).toBe('loading');
      expect(customizationRead).toHaveBeenCalledTimes(1);
    });

    describe('when load is complete', () => {
      beforeEach(() => {
        brainCustomizationStore.load();
      });

      it('status should be complete', () => {
        expect(brainCustomizationStore.status).toBe('complete');
      });

      it('should call the API with the correct params', () => {
        expect(customizationRead).toHaveBeenCalledWith({
          projectUuid: '1234',
        });
      });

      it('should fill the store with the API data', () => {
        expect(brainCustomizationStore).toEqual(
          expect.objectContaining({
            name: { current: 'Initial Name', old: 'Initial Name' },
            role: { current: 'Initial Role', old: 'Initial Role' },
            personality: {
              current: 'Initial Personality',
              old: 'Initial Personality',
            },
            goal: { current: 'Initial Goal', old: 'Initial Goal' },
          }),
        );

        expect(brainCustomizationStore.instructions).toEqual({
          current: [{ id: '1', instruction: 'First Instruction' }],
          old: [{ id: '1', instruction: 'First Instruction' }],
        });
      });

      describe('when the user wants to add a new empty instruction', () => {
        beforeAll(() => {
          brainCustomizationStore.addEmptyInstruction();
        });

        beforeEach(() => {
          vi.clearAllMocks();
        });

        it('should add a new empty instruction', () => {
          expect(brainCustomizationStore.instructions).toEqual({
            current: [
              { id: '1', instruction: 'First Instruction' },
              { instruction: '' },
            ],
            old: [
              { id: '1', instruction: 'First Instruction' },
              { instruction: '' },
            ],
          });
        });

        describe('when the user wants to remove the previously already saved instruction', () => {
          it('should call the API with the correct params', async () => {
            const instructionIndex = 0;

            await brainCustomizationStore.removeInstruction(instructionIndex);

            expect(customizationInstructionDelete).toHaveBeenCalledWith({
              id: '1',
              projectUuid: '1234',
            });
          });

          it('should remove the instruction', () => {
            expect(brainCustomizationStore.instructions).toEqual({
              current: [{ instruction: '' }],
              old: [{ instruction: '' }],
            });
          });
        });

        describe('when the user wants to remove the locally only instruction', () => {
          beforeEach(() => {
            const instructionIndex = 0;

            brainCustomizationStore.removeInstruction(instructionIndex);
          });

          it('should not call the API', () => {
            expect(customizationInstructionDelete).not.toHaveBeenCalled();
          });

          it('should remove the instruction', () => {
            expect(brainCustomizationStore.instructions).toEqual({
              current: [],
              old: [],
            });
          });
        });
      });

      it('has changed should be false', () => {
        expect(brainCustomizationStore.hasChanged).toBe(false);
      });

      describe.each(['name', 'role', 'personality', 'goal'])(
        'when the user changes the %s attribute',
        (attribute) => {
          it('hasChanged should be true', () => {
            brainCustomizationStore[attribute].current = 'Changed';

            expect(brainCustomizationStore.hasChanged).toBe(true);
          });
        },
      );

      it('has changed should be false whe the instruction text changes', () => {
        brainCustomizationStore.instructions.current[0].instruction = 'Changed';

        expect(brainCustomizationStore.hasChanged).toBe(true);
      });
    });
  });

  describe('when the API return error', () => {
    it('status should be error', async () => {
      customizationRead.mockRejectedValueOnce();

      await brainCustomizationStore.load();

      expect(brainCustomizationStore.status).toBe('error');
    });
  });
});
