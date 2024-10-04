import { mount } from '@vue/test-utils';
import ChangesHistory from '@/components/Brain/Tunings/ChangesHistory.vue';
import { createStore } from 'vuex';
import nexusaiAPI from '@/api/nexusaiAPI';
import { nextTick } from 'vue';

vi.spyOn(nexusaiAPI.router.tunings.historyChanges, 'read').mockResolvedValue({
  data: {
    count: 1,
    next: null,
    previous: null,
    results: [
      {
        uuid: 'uuid-test',
        model_group: 'Action',
        action_model: 'Flow',
        created_at: '2024-09-20T14:30:51.023962Z',
        action_details: {
          new: '',
          old: 'Compras de Produtos',
        },
        action_type: 'D',
        project: '32d360ad-f546-489f-87cd-9a71f59dd4d0',
        created_by: 'test@weni.ai',
      },
    ],
  },
});

const store = createStore({
  state() {
    return {
      Auth: {
        connectProjectUuid: 'testProjectUuid',
      },
    };
  },
});

describe('ChangesHistory.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(ChangesHistory, {
      global: {
        plugins: [store],
        stubs: {
          UnnnicIntelligenceText: { template: '<p><slot /></p>' },
          UnnnicSelectSmart: true,
          UnnnicTableNext: true,
        },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('renders the correct header and sub-description text', () => {
    const descriptionText = wrapper.findAll('p');
    expect(descriptionText[0].text()).toContain(
      wrapper.vm.$t('router.tunings.history.description'),
    );
    expect(descriptionText[1].text()).toContain(
      wrapper.vm.$t('router.tunings.history.sub_description'),
    );
  });

  test('updates pagination and calls fetchData on page change', async () => {
    const mockApiResponse = {
      data: {
        results: [{ created_at: '2024-01-01T00:00:00Z', action_details: {} }],
        count: 1,
      },
    };
    nexusaiAPI.router.tunings.historyChanges.read.mockResolvedValueOnce(
      mockApiResponse,
    );

    wrapper.vm.pagination = 2;
    wrapper.vm.currentFilterOption = [{ value: 'all' }];
    await nextTick();

    expect(nexusaiAPI.router.tunings.historyChanges.read).toHaveBeenCalledWith({
      projectUuid: 'testProjectUuid',
      pageSize: wrapper.vm.paginationInterval,
      page: 2,
      filter: '',
    });
  });

  describe('formatTimeSince', () => {
    test('formats time correctly for less than 60 minutes', () => {
      vi.setSystemTime(new Date('2024-01-01T00:59:00Z'));

      const formattedTime = wrapper.vm.formatTimeSince('2024-01-01T00:00:00Z');
      expect(formattedTime).toBe(
        wrapper.vm.$t('time.time_ago_minutes', { count: 59 }),
      );
    });

    test('formats time correctly for less than 24 hours', () => {
      vi.setSystemTime(new Date('2024-01-01T23:00:00Z'));

      const formattedTime = wrapper.vm.formatTimeSince('2024-01-01T00:00:00Z');
      expect(formattedTime).toBe(
        wrapper.vm.$t('time.time_ago_hours', { count: 23 }),
      );
    });

    test('formats time correctly for less than 30 days', () => {
      vi.setSystemTime(new Date('2024-01-30T00:00:00Z'));

      const formattedTime = wrapper.vm.formatTimeSince('2024-01-01T00:00:00Z');
      expect(formattedTime).toBe(
        wrapper.vm.$t('time.time_ago_days', { count: 29 }),
      );
    });

    test('formats time correctly for more than 30 days', () => {
      vi.setSystemTime(new Date('2024-03-01T00:00:00Z'));

      const formattedTime = wrapper.vm.formatTimeSince('2024-01-01T00:00:00Z');
      expect(formattedTime).toBe(
        wrapper.vm.$t('time.time_ago_months', { count: 2 }),
      );
    });
  });

  test('handles rendering logic for table rows', () => {
    wrapper.vm.table.rows = [
      {
        created_at: '2024-01-01T00:00:00Z',
        action_details: {},
        model_group: 'Content',
      },
    ];

    const formattedRows = wrapper.vm.formattedRows;
    expect(formattedRows[0].content[1].props.text).toBe(
      wrapper.vm.formatTimeSince('2024-01-01T00:00:00Z'),
    );
  });

  test('checks if the icon should render in handleIsRenderIcon', () => {
    const rowWithMultipleValues = { action_details: { a: 'test', b: 'test' } };
    const rowWithSingleValue = { action_details: { a: 'new' } };

    expect(wrapper.vm.handleIsRenderIcon(rowWithMultipleValues)).toBe(true);
    expect(wrapper.vm.handleIsRenderIcon(rowWithSingleValue)).toBe(false);
  });

  test('computes noChangesDetected correctly and renders no changes message when noChangesDetected is true', async () => {
    wrapper.vm.currentFilterOption = [{ value: 'all' }];

    await nextTick();

    wrapper.vm.table.rows = [];
    wrapper.vm.isLoading = false;

    await nextTick();

    expect(wrapper.vm.noChangesDetected).toBe(true);
    expect(wrapper.text()).toBe(
      wrapper.vm.$t('router.tunings.history.no_changes'),
    );
  });

  test('computes noChangesDetected correctly when rows are present', async () => {
    wrapper.vm.currentFilterOption = [{ value: 'all' }];
    wrapper.vm.table.rows = [{}];

    await nextTick();

    expect(wrapper.vm.noChangesDetected).toBe(false);
  });

  test('renders description and filter select when there are changes', async () => {
    wrapper.vm.currentFilterOption = [{ value: 'Customization' }];
    wrapper.vm.table.rows = [{ id: 1, content: 'Change 1' }];
    wrapper.vm.isLoading = false;

    await nextTick();
    await nextTick();

    expect(wrapper.vm.noChangesDetected).toBe(false);

    expect(wrapper.text()).toContain(
      wrapper.vm.$t('router.tunings.history.description'),
    );
    expect(wrapper.text()).toContain(
      wrapper.vm.$t('router.tunings.history.sub_description'),
    );

    const selectFilter = wrapper.findComponent('[data-test="select-filter"]');
    expect(selectFilter.exists()).toBe(true);

    const table = wrapper.findComponent('[data-test="table"]');
    expect(table.exists()).toBe(true);
    expect(table.props('pagination')).toBe(wrapper.vm.pagination);
    expect(table.props('headers')).toBe(wrapper.vm.table.headers);
    expect(table.props('rows')).toBe(wrapper.vm.formattedRows);
    expect(table.props('paginationTotal')).toBe(wrapper.vm.paginationTotal);
    expect(table.props('paginationInterval')).toBe(
      wrapper.vm.paginationInterval,
    );
    expect(table.props('isLoading')).toBe(wrapper.vm.isLoading);
  });

  test('fetches data correctly in getChangesHistoryData', async () => {
    await wrapper.vm.getChangesHistoryData(1, 'all');
    expect(wrapper.vm.table.rows).toHaveLength(1);
    expect(wrapper.vm.paginationTotal).toBe(1);
  });

  test('handles API errors gracefully in getChangesHistoryData', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    vi.spyOn(
      nexusaiAPI.router.tunings.historyChanges,
      'read',
    ).mockRejectedValue(new Error('API Error'));
    await wrapper.vm.getChangesHistoryData(1, 'all');
    expect(wrapper.vm.table.rows).toHaveLength(0);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch data:',
      expect.any(Error),
    );
  });
});
