import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useMonitoringStore } from '@/store/Monitoring';
import nexusaiAPI from '@/api/nexusaiAPI.js';

vi.mock('@/api/nexusaiAPI.js');
vi.mock('@/store', () => ({
  default: {
    state: {
      Auth: { connectProjectUuid: '1234' },
    },
  },
}));
vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: {
      started_day: '2024-01-01',
      ended_day: '2024-01-31',
    },
  }),
}));

describe('MonitoringStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useMonitoringStore();
  });

  describe('loadMessages', () => {
    it('should load messages successfully', async () => {
      const mockData = {
        data: [{ id: 1, text: 'Test message' }],
        count: 1,
      };
      nexusaiAPI.router.monitoring.messages.list.mockResolvedValue(mockData);

      await store.loadMessages({
        page: 1,
        pageInterval: 10,
        tag: 'test',
        text: '',
      });

      expect(store.messages.status).toBe('complete');
      expect(store.messages.data).toEqual(mockData.data);
      expect(store.messages.count).toBe(mockData.count);
    });

    it('should handle errors when loading messages', async () => {
      nexusaiAPI.router.monitoring.messages.list.mockRejectedValue(
        new Error('Error'),
      );

      await store.loadMessages({
        page: 1,
        pageInterval: 10,
        tag: 'test',
        text: '',
      });

      expect(store.messages.status).toBe('error');
    });
  });

  describe('loadMessagesPerformance', () => {
    it('should load messages performance successfully', async () => {
      const mockPerformance = {
        action_percentage: 70,
        succeed_percentage: 60,
        failed_percentage: 30,
      };
      nexusaiAPI.router.monitoring.messages.performance.mockResolvedValue(
        mockPerformance,
      );

      await store.loadMessagesPerformance();

      expect(store.messages.performance.status).toBe('complete');
      expect(store.messages.performance.action).toBe(
        mockPerformance.action_percentage,
      );
      expect(store.messages.performance.success).toBe(
        mockPerformance.succeed_percentage,
      );
      expect(store.messages.performance.failed).toBe(
        mockPerformance.failed_percentage,
      );
    });

    it('should set default values when response percentages are undefined', async () => {
      const mockPerformance = {
        action_percentage: undefined,
        succeed_percentage: undefined,
        failed_percentage: undefined,
      };
      nexusaiAPI.router.monitoring.messages.performance.mockResolvedValue(
        mockPerformance,
      );

      await store.loadMessagesPerformance();

      expect(store.messages.performance.status).toBe('complete');
      expect(store.messages.performance.action).toBe(0);
      expect(store.messages.performance.success).toBe(0);
      expect(store.messages.performance.failed).toBe(0);
    });

    it('should handle errors when loading messages performance', async () => {
      nexusaiAPI.router.monitoring.messages.performance.mockRejectedValue(
        new Error('Error'),
      );

      await store.loadMessagesPerformance();

      expect(store.messages.performance.status).toBe('error');
    });
  });
});
