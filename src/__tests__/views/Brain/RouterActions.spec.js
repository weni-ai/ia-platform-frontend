import { mount, flushPromises } from '@vue/test-utils';
import { createStore } from 'vuex';
import nexusaiAPI from '@/api/nexusaiAPI';
import RouterActions from '@/views/Brain/RouterActions.vue';
import ModalActions from '@/components/actions/ModalActions.vue';
import ModalChangeAction from '@/components/actions/ModalChangeAction.vue';
import ModalRemoveAction from '@/components/actions/ModalRemoveAction.vue';
import { createTestingPinia } from '@pinia/testing';
import { useActionsStore } from '@/store/Actions';
import { useAlertStore } from '@/store/Alert';

const mockResponse = [
  {
    uuid: '1',
    name: 'Action 1',
    prompt: 'Description 1',
    content_base: '4',
  },
  {
    uuid: '2',
    name: 'Action 2',
    prompt: 'Description 2',
    content_base: '4',
  },
];

const mockItems = [
  {
    uuid: '1',
    name: 'Action 1',
    description: 'Description 1',
    group: 'custom',
  },
  {
    uuid: '2',
    name: 'Action 2',
    description: 'Description 2',
    group: 'custom',
  },
];

const pinia = createTestingPinia({ stubActions: false });

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

      alert: null,
    };
  },

  getters: {
    actionsTypesAvailable() {
      return [];
    },
  },

  actions: {
    async loadActions({ state: { Actions: state } }) {
      if (state.status !== null) {
        return;
      }

      try {
        state.status = 'loading';

        const { data } = mockItems;

        state.data = data;

        state.status = 'complete';
      } catch (error) {
        state.status = 'error';
      }
    },
  },
});

vi.spyOn(nexusaiAPI.router.actions.flows, 'list').mockResolvedValue({
  data: {},
});

describe('RouterActions', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();

    nexusaiAPI.router.actions.list = vi.fn().mockResolvedValue(mockResponse);

    nexusaiAPI.router.actions.create = vi.fn().mockResolvedValue({
      data: { uuid: '3', name: 'New Action', prompt: 'New Description' },
    });

    nexusaiAPI.router.actions.edit = vi
      .fn()
      .mockResolvedValue({ data: { prompt: 'Updated Description' } });

    nexusaiAPI.router.actions.delete = vi.fn().mockResolvedValue({});

    wrapper = mount(RouterActions, {
      props: {
        items: {
          status: null,
          data: [],
        },
      },
      global: {
        plugins: [store, pinia],
      },
    });

    const actionsStore = useActionsStore();

    actionsStore.load();
  });

  test('opens add action modal and adds a new action', async () => {
    wrapper.findComponent({ name: 'ContentList' }).vm.$emit('add');
    await flushPromises();

    expect(wrapper.vm.isActionTypeSelectorOpen).toBe(true);

    await wrapper.vm.$nextTick();

    await wrapper
      .findComponent({ name: 'ModalActionTypeSelector' })
      .vm.$emit('update:actionGroup', 'custom');

    await wrapper
      .findComponent({ name: 'ModalActionTypeSelector' })
      .vm.$emit('selected');

    expect(wrapper.vm.isAddActionOpen).toBe(true);

    const modalActions = wrapper.findComponent(ModalActions);

    expect(modalActions.exists()).toBeTruthy();
  });

  test('opens delete action modal and deletes an action', async () => {
    const actionToDelete = mockItems[0];

    wrapper.vm.openDeleteAction(actionToDelete.uuid, actionToDelete.name);
    await flushPromises();

    expect(wrapper.vm.modalDeleteAction).toEqual({
      uuid: actionToDelete.uuid,
      name: actionToDelete.name,
      status: null,
    });

    wrapper.findComponent(ModalRemoveAction).vm.$emit('remove');
    await flushPromises();

    expect(nexusaiAPI.router.actions.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        actionUuid: actionToDelete.uuid,
      }),
    );

    const alertStore = useAlertStore();

    expect(wrapper.vm.items.data).not.toContain(actionToDelete);
    expect(alertStore.add).toHaveBeenCalledWith({
      type: 'default',
      text: wrapper.vm.$t('router.actions.router_removed', {
        name: actionToDelete.name,
      }),
    });
  });
});
