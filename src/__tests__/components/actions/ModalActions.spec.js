import { mount } from '@vue/test-utils';
import ModalActions from '@/components/actions/ModalActions.vue';
import nexusaiAPI from '@/api/nexusaiAPI';
import { createStore } from 'vuex';

vi.spyOn(nexusaiAPI.router.actions.flows, 'list').mockResolvedValue({
  data: {
    count: 3,
    next: null,
    previous: null,
    results: [
      {
        uuid: '123',
        name: 'Flows One',
      },
      {
        uuid: '456',
        name: 'Flows Two',
      },
      {
        uuid: '789',
        name: 'Flows Three',
      },
    ],
  },
});

vi.spyOn(
  nexusaiAPI.router.actions.generatedNames,
  'generate',
).mockResolvedValue({
  data: {
    action_name: 'Weni Action',
  },
});

const createRequest = vi
  .spyOn(nexusaiAPI.router.actions, 'create')
  .mockResolvedValue({
    data: {
      uuid: '1234',
      name: 'Action Name',
      prompt: 'Action Description',
      fallback: false,
      content_base: '5678',
    },
  });

const store = createStore({
  state() {
    return {
      Auth: {
        connectProjectUuid: 'test2323test',
      },
    };
  },
});

describe('ModalActions', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = mount(ModalActions, {
      props: {
        modelValue: true,
      },

      global: {
        plugins: [store],
      },
    });

    wrapper.vm.name = 'Action Name';
    wrapper.vm.description = 'Action Description';
    wrapper.vm.flowUuid = '1234';
  });

  describe('when the user is on the first step', () => {
    it('does not show previous button', () => {
      const previousButton = wrapper.find('[data-test="previous-button"]');

      expect(previousButton.exists()).toBeFalsy();
    });
  });

  describe.each([
    {
      stepName: 'describe',
      clicksRequiredToReachTheStep: 0,
    },
    {
      stepName: 'select_flow',
      previousStepName: 'describe',
      clicksRequiredToReachTheStep: 1,
    },
    {
      stepName: 'nominate_action',
      previousStepName: 'select_flow',
      clicksRequiredToReachTheStep: 2,
    },
  ])(
    `when user clicks $clicksRequiredToReachTheStep times on next button`,
    ({ stepName, previousStepName, clicksRequiredToReachTheStep }) => {
      beforeEach(async () => {
        clicksRequiredToReachTheStep;

        const nextButton = wrapper.find('[data-test="next-button"]');

        for (let i = 0; i < clicksRequiredToReachTheStep; i++) {
          nextButton.trigger('click');
        }
      });

      it(`should render ${stepName} step`, () => {
        expect(wrapper.vm.currentStep.name).toBe(stepName);
      });

      if (clicksRequiredToReachTheStep > 0) {
        let previousButton;

        describe('when the user is not on the first step', () => {
          beforeEach(() => {
            previousButton = wrapper.find('[data-test="previous-button"]');
          });

          it('shows previous button', () => {
            expect(previousButton.exists()).toBeTruthy();
          });

          describe('when the user clicks on previous button', () => {
            it(`should render ${previousStepName} step`, () => {
              previousButton.trigger('click');

              expect(wrapper.vm.currentStep.name).toBe(previousStepName);
            });
          });
        });
      }
    },
  );

  describe('when user wants to add the action', () => {
    beforeEach(() => {
      const nextButton = wrapper.find('[data-test="next-button"]');
      const clicksRequiredToReachTheAddTheAction = 3;

      for (let i = 0; i < clicksRequiredToReachTheAddTheAction; i++) {
        nextButton.trigger('click');
      }
    });

    it('should call create action API', () => {
      expect(createRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          projectUuid: 'test2323test',
          name: 'Action Name',
          description: 'Action Description',
          flowUuid: '1234',
        }),
      );
    });

    it('should show success alert message', () => {
      expect(store.state.alert).toEqual({
        type: 'success',
        text: wrapper.vm.$t('modals.actions.add.messages.success', {
          name: 'Action Name',
        }),
      });
    });

    it('emits added with correct object', () => {
      expect(wrapper.emitted('added')).toContainEqual([
        {
          uuid: '1234',
          name: 'Action Name',
          description: 'Action Description',
        },
      ]);
    });
  });

  describe('generateActionName', () => {
    it('should call generate API and update name', async () => {
      await wrapper.vm.generateActionName();
      expect(
        nexusaiAPI.router.actions.generatedNames.generate,
      ).toHaveBeenCalledWith({
        projectUuid: 'test2323test',
        chatbot_goal:
          'Chatbot que sugere nomes para ações baseado na descrição informada',
        context: 'Descrição: Action Description',
      });
      expect(wrapper.vm.name).toBe('Weni Action');
    });
  });

  describe('isNeedGenerateName', () => {
    it('should return true when currentStepIndex is 1', () => {
      wrapper.vm.currentStepIndex = 1;
      expect(wrapper.vm.isNeedGenerateName()).toBe(true);
    });

    it('should return false when currentStepIndex is not 1', () => {
      wrapper.vm.currentStepIndex = 0;
      expect(wrapper.vm.isNeedGenerateName()).toBe(false);
      wrapper.vm.currentStepIndex = 2;
      expect(wrapper.vm.isNeedGenerateName()).toBe(false);
    });
  });

  describe('goToNextStep', () => {
    it('should call generateActionName if isNeedGenerateName returns true', async () => {
      wrapper.vm.currentStepIndex = 1;
      const generateActionNameSpy = vi.spyOn(wrapper.vm, 'generateActionName');
      await wrapper.vm.goToNextStep();
      expect(generateActionNameSpy).toHaveBeenCalled();
    });

    it('should not call generateActionName if isNeedGenerateName returns false', async () => {
      wrapper.vm.currentStepIndex = 0;
      const generateActionNameSpy = vi.spyOn(wrapper.vm, 'generateActionName');
      await wrapper.vm.goToNextStep();
      expect(generateActionNameSpy).not.toHaveBeenCalled();
    });
  });
});
