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

  test('verifies the "Next" button behavior', async () => {
    wrapper.vm.handleNextBtn();

    expect(wrapper.vm.index).toBe(1);

    wrapper.vm.handleNextBtn();
    expect(wrapper.emitted().save).toBeTruthy();
    expect(wrapper.emitted().save[0]).toEqual([
      { flow: { name: '', uuid: '' }, description: '' },
    ]);
  });

  test('verifies the "Back" button behavior', async () => {
    wrapper.vm.index = 1;
    wrapper.vm.handleBackBtn();
    expect(wrapper.vm.index).toBe(0);

    wrapper.vm.handleBackBtn();
    expect(wrapper.emitted().closeModal).toBeTruthy();
  });

  test('selects a flow and checks the selection', async () => {
    await wrapper.vm.loadMoreFlows();
    await flushPromises();

    wrapper.vm.handleFlowSelected(mockData.results[0]);

    expect(wrapper.vm.flowSelected).toEqual(mockData.results[0]);

    await wrapper.vm.$nextTick();

    const selectedItem = wrapper.find(
      '.flow-modal__body__flow__list__item--selected',
    );
    expect(selectedItem.exists()).toBe(true);
    expect(selectedItem.text()).toContain('Flow 1');
  });

  test('updates the filter and checks the results', async () => {
    wrapper.vm.filterName = 'New Filter';

    await new Promise((resolve) => setTimeout(resolve, 301));

    await flushPromises();

    expect(nexusaiAPI.router.actions.flows.list).toHaveBeenCalledWith({
      next: null,
      projectUuid: wrapper.vm.$store.state.Auth.connectProjectUuid,
      name: 'New Filter',
    });
  });

  test('renders "not found" message when no items are found', async () => {
    nexusaiAPI.router.actions.flows.list = vi
      .fn()
      .mockResolvedValue({ data: { results: [], next: null } });

    await wrapper.vm.loadMoreFlows();
    await flushPromises();

    expect(wrapper.vm.items.data).toEqual([]);
    expect(wrapper.vm.items.status).toBe('complete');

    const notFoundMessage = wrapper.find(
      '.flow-modal__body__not_found_container',
    );
    expect(notFoundMessage.exists()).toBe(true);
    expect(notFoundMessage.text()).toContain(
      wrapper.vm.$t('modals.actions.flow.not_found_message'),
    );
  });
});
