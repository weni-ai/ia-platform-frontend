import { mount, flushPromises } from '@vue/test-utils';
import { createStore } from 'vuex';
import nexusaiAPI from '@/api/nexusaiAPI';
import RouterActions from '@/views/Brain/RouterActions.vue';
import ModalActions from '@/components/actions/ModalActions.vue';
import ModalChangeAction from '@/components/actions/ModalChangeAction.vue';
import ModalRemoveAction from '@/components/actions/ModalRemoveAction.vue';

const store = createStore({
  state() {
    return {
      Auth: {
        connectProjectUuid: 'test2323test',
      },
      alert: null,
    };
  },
});

const mockItems = {
  data: [
    {
      uuid: '1',
      created_file_name: 'Action 1',
      description: 'Description 1',
    },
    {
      uuid: '2',
      created_file_name: 'Action 2',
      description: 'Description 2',
    },
  ],
  status: null,
};

describe('RouterActions', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();

    nexusaiAPI.router.actions.list = vi
      .fn()
      .mockResolvedValue({ data: mockItems.data });

    nexusaiAPI.router.actions.create = vi.fn().mockResolvedValue({
      data: { uuid: '3', name: 'New Action', prompt: 'New Description' },
    });

    nexusaiAPI.router.actions.edit = vi
      .fn()
      .mockResolvedValue({ data: { prompt: 'Updated Description' } });

    nexusaiAPI.router.actions.delete = vi.fn().mockResolvedValue({});

    wrapper = mount(RouterActions, {
      props: {
        items: mockItems,
      },
      global: {
        plugins: [store],
      },
    });
  });

  test('loads actions on created hook', async () => {
    await flushPromises();

    expect(nexusaiAPI.router.actions.list).toHaveBeenCalledWith({
      projectUuid: store.state.Auth.connectProjectUuid,
    });
    expect(wrapper.vm.items.data).toEqual(mockItems.data);
    expect(wrapper.vm.items.status).toBe('complete');
  });

  test('opens add action modal and saves a new action', async () => {
    wrapper.findComponent({ name: 'BasesFormGenericList' }).vm.$emit('add');
    await flushPromises();

    expect(wrapper.vm.isAddActionOpen).toBe(true);

    wrapper.findComponent(ModalActions).vm.$emit('save', {
      flow: { uuid: 'new-flow-uuid', name: 'New Flow' },
      description: 'New Description',
    });

    await flushPromises();

    expect(nexusaiAPI.router.actions.create).toHaveBeenCalledWith({
      projectUuid: store.state.Auth.connectProjectUuid,
      flowUuid: 'new-flow-uuid',
      name: 'New Flow',
      description: 'New Description',
    });

    expect(wrapper.vm.items.data).toContainEqual({
      uuid: '3',
      extension_file: 'action',
      created_file_name: 'New Action',
      description: 'New Description',
    });
    expect(store.state.alert).toEqual({
      type: 'success',
      text: wrapper.vm.$t('router.actions.router_activated', {
        name: 'New Flow',
      }),
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
    console.log('vm ModalEditCation', wrapper.vm.modalEditAction, actionToEdit);
    expect(wrapper.vm.modalEditAction).toEqual({
      uuid: actionToEdit.uuid,
      name: actionToEdit.created_file_name,
      description: actionToEdit.description,
      status: null,
    });

    wrapper.findComponent(ModalChangeAction).vm.$emit('edit');
    await flushPromises();

    expect(nexusaiAPI.router.actions.edit).toHaveBeenCalledWith({
      projectUuid: store.state.Auth.connectProjectUuid,
      actionUuid: actionToEdit.uuid,
      description: actionToEdit.description,
    });

    expect(actionToEdit.description).toBe('Updated Description');
    expect(store.state.alert).toEqual({
      type: 'success',
      text: wrapper.vm.$t('router.actions.router_edited', {
        name: actionToEdit.created_file_name,
      }),
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
      text: wrapper.vm.$t('router.actions.router_removed'),
    });
  });

  test('renders correctly when no items are found', async () => {
    nexusaiAPI.router.actions.list = vi.fn().mockResolvedValue({ data: [] });
    wrapper.vm.items.status = null;

    await wrapper.vm.loadActions();
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.items.data).toEqual([]);
    expect(wrapper.vm.items.status).toBe('complete');
  });
});
