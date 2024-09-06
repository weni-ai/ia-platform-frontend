import { mount, flushPromises } from '@vue/test-utils';
import { createStore } from 'vuex';
import nexusaiAPI from '@/api/nexusaiAPI';
import RouterActions from '@/views/Brain/RouterActions.vue';
import ModalActions from '@/components/actions/ModalActions.vue';
import ModalChangeAction from '@/components/actions/ModalChangeAction.vue';
import ModalRemoveAction from '@/components/actions/ModalRemoveAction.vue';

const mockResponse = {
  data: [
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
  ],
};

const mockItems = {
  data: [
    {
      uuid: '1',
      created_file_name: 'Action 1',
      description: 'Description 1',
      extension_file: 'action',
    },
    {
      uuid: '2',
      created_file_name: 'Action 2',
      description: 'Description 2',
      extension_file: 'action',
    },
  ],
  status: null,
};

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
        plugins: [store],
      },
    });

    wrapper.vm.$store.dispatch('loadActions');
  });

  test('opens add action modal and adds a new action', async () => {
    wrapper.findComponent({ name: 'ContentList' }).vm.$emit('add');
    await flushPromises();

    expect(wrapper.vm.isActionTypeSelectorOpen).toBe(true);

    await wrapper
      .findComponent({ name: 'ModalActionTypeSelector' })
      .vm.$emit('selected', 'custom');

    expect(wrapper.vm.isAddActionOpen).toBe(true);

    const modalActions = wrapper.findComponent(ModalActions);

    expect(modalActions.exists()).toBeTruthy();

    modalActions.vm.$emit('added', {
      uuid: 'new-flow-uuid',
      name: 'New Action',
      description: 'New Description',
    });

    await flushPromises();

    expect(wrapper.vm.items.data).toContainEqual({
      uuid: 'new-flow-uuid',
      extension_file: 'action',
      created_file_name: 'New Action',
      description: 'New Description',
    });
  });

  test('opens edit action modal and edits an action', async () => {
    const actionToEdit = {
      uuid: '1',
      created_file_name: 'Action 1',
      description: 'Updated Description',
      status: null,
    };

    wrapper.vm.openEditAction(actionToEdit);
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.currentActionEditing).toEqual({
      uuid: actionToEdit.uuid,
      name: actionToEdit.created_file_name,
      description: actionToEdit.description,
      status: null,
    });

    wrapper.findComponent(ModalChangeAction).vm.$emit('edited', '1', {
      name: 'Action Name Edited',
      description: 'Action Description Edited',
    });

    await flushPromises();

    expect(wrapper.vm.items.data).toContainEqual({
      uuid: '1',
      extension_file: 'action',
      created_file_name: 'Action Name Edited',
      description: 'Action Description Edited',
    });
  });

  test('opens delete action modal and deletes an action', async () => {
    const actionToDelete = mockItems.data[0];

    wrapper.vm.openDeleteAction(
      actionToDelete.uuid,
      actionToDelete.created_file_name,
    );
    await flushPromises();

    expect(wrapper.vm.modalDeleteAction).toEqual({
      uuid: actionToDelete.uuid,
      name: actionToDelete.created_file_name,
      status: null,
    });

    wrapper.findComponent(ModalRemoveAction).vm.$emit('remove');
    await flushPromises();

    expect(nexusaiAPI.router.actions.delete).toHaveBeenCalledWith({
      projectUuid: store.state.Auth.connectProjectUuid,
      actionUuid: actionToDelete.uuid,
    });

    expect(wrapper.vm.items.data).not.toContain(actionToDelete);
    expect(store.state.alert).toEqual({
      type: 'default',
      text: wrapper.vm.$t('router.actions.router_removed', {
        name: actionToDelete.created_file_name,
      }),
    });
  });
});
