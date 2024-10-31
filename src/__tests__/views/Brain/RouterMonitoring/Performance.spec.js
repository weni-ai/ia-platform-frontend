import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { useMonitoringStore } from '@/store/Monitoring';
import i18n from '@/utils/plugins/i18n';
import RouterMonitoringPerformance from '@/views/Brain/RouterMonitoring/RouterMonitoringPerformance.vue';
import { createTestingPinia } from '@pinia/testing';

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
        performance: {
          status: 'loaded',
          action: 5.7,
          success: 75.3,
          failed: 20,
        },
      },
    },
  },
});

describe('RouterMonitoringPerformance.vue', () => {
  let wrapper;
  const monitoringStore = useMonitoringStore();

  beforeEach(async () => {
    wrapper = mount(RouterMonitoringPerformance, {
      global: { plugins: [pinia, router] },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering Elements', () => {
    it('renders the title correctly', () => {
      const title = wrapper.find('[data-test="title"]');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe(i18n.global.t('router.monitoring.performance'));
    });

    it('renders cards for each answer type', () => {
      const cards = wrapper.findAll('[data-test="card"]');
      expect(cards.length).toBe(3); // success, failed, action
    });

    it('displays tooltip with correct text', () => {
      const card = wrapper.find('.performance__card--success');
      const tooltip = card.findComponent('[data-test="card-tooltip"]');
      expect(tooltip.props('text')).toBe(
        i18n.global.t('router.monitoring.success.tooltip'),
      );
    });
  });

  describe('Card Content', () => {
    it.each([
      ['success', 75.3],
      ['failed', 20],
      ['action', 5.7],
    ])('displays correct title and value for %s', async (type, value) => {
      await nextTick();
      const card = wrapper.find(`.performance__card--${type}`);
      const title = card.find('[data-test="card-title"]');
      const cardValue = card.find('[data-test="card-value"]');

      expect(title.text()).toBe(
        i18n.global.t(`router.monitoring.${type}.title`, { count: 2 }),
      );
      expect(cardValue.text()).toBe(`${wrapper.vm.formatLocaleNumber(value)}%`);
    });

    describe('formatLocaleNumber', () => {
      const formatLocaleNumber = (num) => wrapper.vm.formatLocaleNumber(num);

      it('should format integer numbers without decimal places', () => {
        expect(formatLocaleNumber(1000)).toBe('1,000');
        expect(formatLocaleNumber(500)).toBe('500');
        expect(formatLocaleNumber(12345)).toBe('12,345');
      });

      it('should format decimal numbers with one decimal place', () => {
        expect(formatLocaleNumber(1000.5)).toBe('1,000.5');
        expect(formatLocaleNumber(500.8)).toBe('500.8');
        expect(formatLocaleNumber(12345.3)).toBe('12,345.3');
      });

      it('should handle edge cases', () => {
        expect(formatLocaleNumber(0)).toBe('0');
        expect(formatLocaleNumber(-12345.6)).toBe('-12,345.6');
        expect(formatLocaleNumber(0.0)).toBe('0');
      });

      it('should use the specified locale for formatting', () => {
        i18n.global.locale = 'pt-BR';

        expect(formatLocaleNumber(1000)).toBe('1.000');
        expect(formatLocaleNumber(1000.5)).toBe('1.000,5');

        i18n.global.locale = 'en-US';
      });
    });
  });

  describe('Loading State', () => {
    it('shows skeleton loading while loading performance data', async () => {
      monitoringStore.messages.performance.status = 'loading';
      await nextTick();

      const skeleton = wrapper.findComponent(
        '[data-test="card-value-skeleton"]',
      );

      expect(skeleton.exists()).toBe(true);

      const cardValue = wrapper.find('[data-test="card-value"]');
      expect(cardValue.exists()).toBe(false);
    });

    it('does not show skeleton when performance data is loaded', async () => {
      monitoringStore.messages.performance.status = 'loaded';
      await nextTick();

      const skeleton = wrapper.findComponent({ name: 'UnnnicSkeletonLoading' });
      expect(skeleton.exists()).toBe(false);

      const cardValue = wrapper.find('[data-test="card-value"]');
      expect(cardValue.exists()).toBe(true);
    });
  });

  describe('Data Fetching', () => {
    it('calls loadMessagesPerformance on component mount', () => {
      expect(monitoringStore.loadMessagesPerformance).toHaveBeenCalledTimes(1);
    });

    it('re-fetches data when route query changes', async () => {
      router.replace({
        path: '/monitoring',
        query: { started_day: '2000-01-01' },
      });
      await flushPromises();
      expect(monitoringStore.loadMessagesPerformance).toHaveBeenCalled();
    });
  });
});
