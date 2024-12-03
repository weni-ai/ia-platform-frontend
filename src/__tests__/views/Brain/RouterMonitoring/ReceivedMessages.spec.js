import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { useMonitoringStore } from '@/store/Monitoring';
import i18n from '@/utils/plugins/i18n';
import RouterMonitoringReceivedMessages from '@/views/Brain/RouterMonitoring/RouterMonitoringReceivedMessages.vue';
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';

const routes = [
  { path: '/monitoring', name: 'router-monitoring', component: {} },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const pinia = createTestingPinia({
  initialState: {
    monitoring: {
      messages: {
        count: 0,
        data: [],
        status: 'loading',
        inspectedAnswer: {},
      },
    },
  },
});

describe('RouterMonitoringReceivedMessages.vue', () => {
  let wrapper;
  const monitoringStore = useMonitoringStore();

  beforeEach(() => {
    wrapper = mount(RouterMonitoringReceivedMessages, {
      global: { plugins: [pinia, router] },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering elements', () => {
    it('renders the title correctly', () => {
      const title = wrapper.findComponent('[data-test="title"]');
      expect(title.text()).toBe(
        i18n.global.t('router.monitoring.received_messages'),
      );
    });

    it('renders filters correctly', () => {
      const input = wrapper.findComponent('[data-test="filter-text"]');
      expect(input.exists()).toBe(true);
      expect(input.props('placeholder')).toBe(
        i18n.global.t('router.monitoring.search_message'),
      );

      const select = wrapper.findComponent('[data-test="filter-tag"]');
      expect(select.exists()).toBe(true);
    });

    it('renders the table when messages are present', async () => {
      const table = wrapper.findComponent('[data-test="messages-table"]');

      expect(table.exists()).toBe(true);
      expect(table.props('isLoading')).toBe(true);

      monitoringStore.messages.count = 1;
      monitoringStore.messages.data = [
        { created_at: new Date(), text: 'Test Message', tag: 'success' },
      ];
      monitoringStore.messages.status = 'loaded';

      await wrapper.vm.$nextTick();

      expect(table.props('isLoading')).toBe(false);
      expect(table.props('rows')).toHaveLength(1);
    });

    it('shows no message received info when there are no messages', async () => {
      monitoringStore.messages.count = 0;
      monitoringStore.messages.status = 'loaded';
      await wrapper.vm.$nextTick();

      const noMessageInfo = wrapper.find('[data-test="no-message-received"]');
      expect(noMessageInfo.exists()).toBe(true);
      expect(noMessageInfo.text()).toBe(
        i18n.global.t('router.monitoring.no_message_received'),
      );
    });

    it('does not display "no message received" text when messages are present', async () => {
      monitoringStore.messages.count = 1;
      monitoringStore.messages.data = [
        { created_at: new Date(), text: 'Test message', tag: 'success' },
      ];
      await wrapper.vm.$nextTick();

      const noMessageInfo = wrapper.find('[data-test="no-message-received"]');
      expect(noMessageInfo.exists()).toBe(false);
    });
  });

  describe('Table behaviors', () => {
    it('emits row-click and updates inspectedAnswer.id correctly', async () => {
      monitoringStore.messages.inspectedAnswer.status = 'loading';
      const table = wrapper.findComponent('[data-test="messages-table"]');
      await table.vm.$emit('row-click', { id: 1 });

      expect(monitoringStore.messages.inspectedAnswer.id).toBe(1);
    });

    it('load the table rows tags correctly for different tags', async () => {
      monitoringStore.messages = {
        count: 1,
        status: 'loaded',
        data: [{ created_at: new Date(), text: 'Test Message' }],
        inspectedAnswer: {},
      };

      const formatedRowProps = () =>
        wrapper.vm.formattedMessagesRows[0].content[2].props;

      const setDataRowTag = (tag) =>
        (monitoringStore.messages.data[0].tag = tag);

      setDataRowTag('success');

      expect(formatedRowProps().scheme).toBe('aux-green-500');
      expect(formatedRowProps().leftIcon).toBe('check_circle');

      setDataRowTag('failed');

      expect(formatedRowProps().scheme).toBe('aux-red-500');
      expect(formatedRowProps().leftIcon).toBe('cancel');

      setDataRowTag('action_started');

      expect(formatedRowProps().scheme).toBe('aux-blue-500');
      expect(formatedRowProps().leftIcon).toBe('bolt');
    });
  });

  describe('Filters behaviors', () => {
    it('calls loadMessages when the filters change', async () => {
      wrapper.vm.filters.text = 'New message';
      await wrapper.vm.$nextTick();
      expect(monitoringStore.loadMessages).toHaveBeenCalledTimes(2);

      wrapper.vm.filters.tag = [{ value: 'success' }];
      await wrapper.vm.$nextTick();
      expect(monitoringStore.loadMessages).toHaveBeenCalledTimes(3);
    });

    it('calls loadMessages on pagination change', async () => {
      wrapper.vm.pagination = 2;
      await wrapper.vm.$nextTick();

      expect(monitoringStore.loadMessages).toHaveBeenCalledWith({
        page: 2,
        pageInterval: 15,
        tag: '',
        text: '',
      });
    });
  });
});
