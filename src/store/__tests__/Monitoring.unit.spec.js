import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useMonitoringStore } from '@/store/Monitoring';
import globalStore from '@/store';
import nexusaiAPI from '@/api/nexusaiAPI.js';
import i18n from '@/utils/plugins/i18n';

vi.mock('@/api/nexusaiAPI.js');
vi.mock('@/store', () => ({
  default: {
    state: {
      Auth: { connectProjectUuid: '1234' },
      alert: null,
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

  describe('loadMessageDetails', () => {
    it('should load message details successfully', async () => {
      const mockResponse = {
        uuid: '12345',
        text: 'Sample message text',
        status: 's',
        actions_started: true,
        actions_uuid: '12345678',
        actions_type: 'actionType',
        llm_response: 'Sample LLM response',
        is_approved: true,
        contact_urn: 'urn:12345',
        groundedness: [],
      };

      nexusaiAPI.router.monitoring.messages.detail.mockResolvedValue(
        mockResponse,
      );

      await store.loadMessageDetails({ id: '123' });

      expect(store.messages.inspectedAnswer.status).toBe('complete');
      expect(store.messages.inspectedAnswer).toEqual({
        id: '123',
        uuid: '12345',
        text: 'Sample message text',
        action: {
          name: 'actionType',
          uuid: '12345678',
        },
        llm: {
          response: 'Sample LLM response',
          status: 'action',
        },
        contact_urn: 'urn:12345',
        is_approved: true,
        groundedness: [],
        status: 'complete',
      });
    });

    it('should handle errors when loading message details', async () => {
      nexusaiAPI.router.monitoring.messages.detail.mockRejectedValue(
        new Error('Error'),
      );

      await store.loadMessageDetails({ id: '123' });

      expect(store.messages.inspectedAnswer.status).toBe('error');
      expect(globalStore.state.alert).toEqual({
        type: 'error',
        text: i18n.global.t('router.monitoring.error_loading_messages'),
      });
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

  describe('rateAnswer', () => {
    it('should rate answer successfully', async () => {
      const mockData = {
        is_approved: true,
      };
      nexusaiAPI.router.monitoring.messages.rateAnswer.mockResolvedValue(
        mockData,
      );

      await store.rateAnswer(mockData);

      expect(store.messages.inspectedAnswer.is_approved).toBe(true);
    });

    it('should handle errors', async () => {
      nexusaiAPI.router.monitoring.messages.rateAnswer.mockRejectedValue(
        new Error('Error'),
      );

      await expect(
        store.rateAnswer({
          is_approved: true,
        }),
      ).rejects.toThrow('Error');

      expect(store.messages.inspectedAnswer.is_approved).toBeUndefined();
    });
  });
});
