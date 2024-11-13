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
    inspectedAnswer: {},
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

  async function loadMessageDetails({ id }) {
    try {
      messages.inspectedAnswer.status = 'loading';

      const response = await nexusaiAPI.router.monitoring.messages.detail({
        projectUuid: connectProjectUuid.value,
        id,
      });

      const {
        uuid,
        text,
        status,
        actions_started,
        actions_uuid,
        actions_type,
        llm_response,
        is_approved,
        contact_urn,
        groundedness,
      } = response;

      const llmStatusMap = {
        s: 'success',
        f: 'failed',
      };

      messages.inspectedAnswer = {
        id,
        uuid,
        text,
        action: actions_started
          ? {
              name: actions_type,
              uuid: actions_uuid,
            }
          : null,
        llm: {
          response: llm_response,
          status: actions_started
            ? 'action'
            : llmStatusMap[status.toLowerCase()],
        },
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
    loadMessageDetails,
    loadMessagesPerformance,
  };
});
