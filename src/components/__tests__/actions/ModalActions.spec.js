import { mount, flushPromises } from '@vue/test-utils';
import ModalActions from '@/components/actions/ModalActions.vue';
import nexusaiAPI from '../../../api/nexusaiAPI';
import { createStore } from 'vuex';

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

  const mockData = {
    results: [
      { name: 'Flow 1', uuid: '1' },
      { name: 'Flow 2', uuid: '2' },
    ],
    next: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    nexusaiAPI.router.actions.flows.list = vi
      .fn()
      .mockResolvedValue({ data: mockData });

    wrapper = mount(ModalActions, {
      props: {
        saving: false,
      },
      global: {
        plugins: [store],
      },
    });
  });

  test('checks whether actions render correctly', async () => {
    await wrapper.vm.loadMoreFlows();

    await flushPromises();

    expect(nexusaiAPI.router.actions.flows.list).toHaveBeenCalledWith({
      next: null,
      projectUuid: wrapper.vm.$store.state.Auth.connectProjectUuid,
      name: '',
    });

    expect(wrapper.vm.items.data).toEqual(mockData.results);
    expect(wrapper.vm.items.status).toBe('complete');

    const flowItems = wrapper.findAll('.flow-modal__body__flow__list__item');

    expect(flowItems).toHaveLength(2);
    expect(flowItems[0].text()).toContain('Flow 1');
    expect(flowItems[1].text()).toContain('Flow 2');
  });
});
