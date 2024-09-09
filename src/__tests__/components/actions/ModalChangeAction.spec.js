import { flushPromises, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import ModalChangeAction from '@/components/actions/ModalChangeAction.vue';
import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';
import { Actions as ActionsAPI } from '@/api/nexus/Actions';
import { useAlertStore } from '@/store/Alert';
import { useActionsStore } from '@/store/Actions';
import { createTestingPinia } from '@pinia/testing';

vi.spyOn(nexusaiAPI.router.actions.flows, 'list').mockResolvedValue({
  data: {
    count: 2,
    next: null,
    previous: null,
    results: [
      {
        uuid: '1234',
        name: 'Flow One',
      },
      {
        uuid: '5678',
        name: 'Flow Two',
      },
    ],
  },
});

const editRequest = vi
  .spyOn(nexusaiAPI.router.actions, 'edit')
  .mockResolvedValue({
    uuid: '1234',
    name: 'Action Name Edited',
    prompt: 'Action Description Edited',
  });

vi.spyOn(ActionsAPI, 'list').mockResolvedValue([
  {
    uuid: '1234',
    name: 'Action Name',
    prompt: 'Action Description',
  },
]);

vi.mock('@/store', () => ({
  default: {
    state: {
      Auth: {
        connectProjectUuid: 'test2323test',
      },
    },
  },
}));

const store = createStore({
  state() {
    return {
      Actions: {
        status: null,
        data: [],

        types: {
          status: null,
          data: [],
        },
      },
      Auth: {
        connectProjectUuid: 'test2323test',
      },
    };
  },
});

global.runtimeVariables = {
  get(name) {
    return {
      TEMPLATE_LINK_FLOW_EDITOR:
        'https://floweditor/{dashProjectUuid}/flow/{flowUuid}',
    }[name];
  },
};

const pinia = createTestingPinia({ stubActions: false });

describe('ModalChangeAction', () => {
  let wrapper;

  const setup = () =>
    mount(ModalChangeAction, {
      props: {
        modelValue: true,
        action: {
          uuid: '1234',
          name: 'Action Name',
          description: 'Action Description',
          group: 'custom',
        },
      },

      global: {
        plugins: [store, pinia],
      },
    });

  it('should fill the name input and the description textarea', () => {
    wrapper = setup();

    const name = wrapper.find('[data-test="name-input"]');
    const description = wrapper.find('[data-test="description-textarea"]');

    expect(name.wrapperElement.querySelector('input').value).toBe(
      'Action Name',
    );

    expect(description.wrapperElement.querySelector('textarea').value).toBe(
      'Action Description',
    );
  });

  it('displays the flow name', async () => {
    wrapper = setup();

    await flushPromises();

    const flowName = wrapper.find('[data-test="flow-name"]');

    expect(flowName.text()).toBe('Flow One');
  });

  describe('when an error occour on list flows API', () => {
    it('should show error', async () => {
      vi.spyOn(nexusaiAPI.router.actions.flows, 'list').mockRejectedValueOnce({
        data: {},
      });

      wrapper = setup();

      await flushPromises();

      const flowName = wrapper.find('[data-test="flow-name"]');

      expect(flowName.text()).toBe(
        i18n.global.t('modals.actions.edit.flow_name_unavailable'),
      );
    });
  });

  describe('when the user clicks to go to the flow', () => {
    it('should open the flow editor', () => {
      wrapper = setup();

      const windowOpen = vi.spyOn(window, 'open').mockImplementation(vi.fn());

      const goToFlowButton = wrapper.find('[data-test="go-to-flow-button"]');

      goToFlowButton.trigger('click');

      expect(windowOpen).toHaveBeenCalledWith(
        'https://floweditor/test2323test/flow/1234',
      );
    });
  });

  describe('when the user wants to save the changes', () => {
    beforeEach(async () => {
      wrapper = setup();

      const actionsStore = useActionsStore();
      await actionsStore.load();

      const name = wrapper.findComponent('[data-test="name-input"]');
      const description = wrapper.findComponent(
        '[data-test="description-textarea"]',
      );

      const saveButton = wrapper.find('[data-test="save-button"]');

      await name.vm.$emit('update:modelValue', 'Action Name Edited');
      await description.vm.$emit(
        'update:modelValue',
        'Action Description Edited',
      );

      saveButton.trigger('click');
    });

    it('should call edit action API', () => {
      expect(editRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          projectUuid: 'test2323test',
          name: 'Action Name Edited',
          prompt: 'Action Description Edited',
          actionUuid: '1234',
        }),
      );
    });

    it('should show success alert message', () => {
      const alertStore = useAlertStore();

      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'success',
        text: wrapper.vm.$t('modals.actions.edit.messages.success', {
          name: 'Action Name Edited',
        }),
      });
    });
  });
});
