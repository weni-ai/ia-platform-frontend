import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router';

import nexusaiAPI from '@/api/nexusaiAPI.js';
import globalStore from '.';

export const useMonitoringStore = defineStore('monitoring', () => {
  const connectProjectUuid = computed(
    () => globalStore.state.Auth.connectProjectUuid,
  );

  const route = useRoute();

  const messages = reactive({
    status: null,
    data: [],
    count: 0,
    performance: {
      status: null,
      action: 0,
      success: 0,
      failed: 0,
    },
    inspectedAnswer: null,
  });

  async function loadMessages({ page, pageInterval, tag, text }) {
    const { started_day, ended_day } = route.query;
    try {
      messages.status = 'loading';

      const { data, count } = await nexusaiAPI.router.monitoring.messages.list({
        projectUuid: connectProjectUuid.value,
        page,
        pageInterval,
        tag,
        text,
        started_day,
        ended_day,
      });

      messages.data = data;
      messages.count = count;
      messages.status = 'complete';
    } catch (error) {
      messages.status = 'error';
    }
  }

  async function loadMessagesHistory({ id }) {
    try {
      messages.inspectedAnswer = null;
      messages.inspectedAnswer.status = 'loading';

      const {
        id: responseId,
        text,
        status,
        llm_response,
        is_approved,
        contact_urn,
        groundedness,
      } = (await nexusaiAPI.router.monitoring.messages.history({
        projectUuid: connectProjectUuid.value,
        id,
      })) ?? {};

      const llmStatusMap = {
        s: 'success',
        f: 'failed',
        a: 'action',
      };

      messages.inspectedAnswer = {
        id: responseId,
        text,
        llm_response_status: llmStatusMap[status.toLowerCase()],
        llm_response,
        contact_urn,
        is_approved,
        groundedness,
        status: 'complete',
      };
    } catch (error) {
      messages.inspectedAnswer.status = 'error';
    }
  }

  async function loadMessagesPerformance() {
    const { started_day, ended_day } = route.query;
    try {
      messages.performance.status = 'loading';

      const response = await nexusaiAPI.router.monitoring.messages.performance({
        projectUuid: connectProjectUuid.value,
        started_day,
        ended_day,
      });

      messages.performance = {
        status: 'complete',
        action: response?.action_percentage || 0,
        success: response?.succeed_percentage || 0,
        failed: response?.failed_percentage || 0,
      };
    } catch (error) {
      messages.performance.status = 'error';
    }
  }

  return {
    messages,
    loadMessages,
    loadMessagesHistory,
    loadMessagesPerformance,
  };
});
