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

  describe('isSaveButtonDisabled', () => {
    it('should be true when hasChanged is false', () => {
      expect(brainCustomizationStore.isSaveButtonDisabled).toBe(true);
    });

    it('should be false when hasChanged is true', () => {
      brainCustomizationStore.name.current = 'Changed';
      expect(brainCustomizationStore.isSaveButtonDisabled).toBe(false);
    });

    it('should be true when errorRequiredFields is not empty', () => {
      brainCustomizationStore.errorRequiredFields = { name: true };
      expect(brainCustomizationStore.isSaveButtonDisabled).toBe(true);
    });

    it('should be false when errorRequiredFields is empty', () => {
      brainCustomizationStore.errorRequiredFields = {};
      brainCustomizationStore.name.current = 'Changed';
      expect(brainCustomizationStore.isSaveButtonDisabled).toBe(false);
    });
  });

  describe('validate', () => {
    it('should throw an error when name is empty', () => {
      brainCustomizationStore.name.current = '';
      expect(() => brainCustomizationStore.validate()).toThrowError();
    });

    it('should throw an error when role is empty', () => {
      brainCustomizationStore.role.current = '';
      expect(() => brainCustomizationStore.validate()).toThrowError();
    });

    it('should throw an error when goal is empty', () => {
      brainCustomizationStore.goal.current = '';
      expect(() => brainCustomizationStore.validate()).toThrowError();
    });

    it('should not throw an error when all fields are filled', () => {
      brainCustomizationStore.name.current = 'Test Name';
      brainCustomizationStore.role.current = 'Test Role';
      brainCustomizationStore.goal.current = 'Test Goal';
      expect(() => brainCustomizationStore.validate()).not.toThrowError();
    });

    it('should set errorRequiredFields correctly', () => {
      brainCustomizationStore.name.current = '';
      brainCustomizationStore.role.current = 'Test Role';
      brainCustomizationStore.goal.current = 'Test Goal';

      try {
        brainCustomizationStore.validate();
      } catch (e) {
        // this catch is only here to make the test pass without throwing
      }

      expect(brainCustomizationStore.errorRequiredFields).toMatchObject({
        name: true,
      });
    });

    it('should watch for changes in required fields', () => {
      brainCustomizationStore.name.current = '';
      try {
        brainCustomizationStore.validate();
      } catch (e) {
        // this catch is only here to make the test pass without throwing
      }
      brainCustomizationStore.name.current = 'Test Name';
      expect(brainCustomizationStore.errorRequiredFields).toMatchObject({
        name: true,
      });
    });
  });

  describe('save', () => {
    it('should call nexusaiAPI with correct data', async () => {
      const editSpy = vi.spyOn(nexusaiAPI.router.customization, 'edit');
      brainCustomizationStore.name.current = 'Test Name';
      brainCustomizationStore.role.current = 'Test Role';
      brainCustomizationStore.personality.current = 'Test Personality';
      brainCustomizationStore.instructions.current = ['Test Instruction'];
      brainCustomizationStore.goal.current = 'Test Goal';
      await brainCustomizationStore.save();
      expect(editSpy).toHaveBeenCalledTimes(1);
      expect(editSpy).toHaveBeenCalledWith({
        data: {
          agent: {
            goal: 'Test Goal',
            name: 'Test Name',
            personality: 'Test Personality',
            role: 'Test Role',
          },
          instructions: [],
        },
        projectUuid: '1234',
      });
    });
  });
});
