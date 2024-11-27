import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router';

import nexusaiAPI from '@/api/nexusaiAPI.js';
import globalStore from '.';
import i18n from '@/utils/plugins/i18n';

export const useMonitoringStore = defineStore('monitoring', () => {
  const connectProjectUuid = computed(
    () => globalStore.state.Auth.connectProjectUuid,
  );

  const route = useRoute();

  const messages = reactive({
    status: null,
    data: [],
    count: 0,
    newMessages: [],
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
    const currentNewMessages = [...messages.newMessages];

    try {
      messages.status = 'loading';
      messages.newMessages = [];

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
      messages.newMessages = currentNewMessages;
    }
  }

  async function loadMessageContext({ id }) {
    messages.inspectedAnswer.context = {};
    const setStatus = (status) =>
      (messages.inspectedAnswer.context.status = status);

    try {
      setStatus('loading');

      const response =
        await nexusaiAPI.router.monitoring.messages.getMessageContext({
          projectUuid: connectProjectUuid.value,
          id: id,
        });

      messages.inspectedAnswer.context = response?.map(
        ({ id, llm_response, tag }) => ({
          id,
          llm: { response: llm_response, status: tag },
        }),
      );

      setStatus('complete');
    } catch (error) {
      setStatus('error');

      globalStore.state.alert = {
        type: 'error',
        text: i18n.global.t(
          'router.monitoring.error_loading_previous_messages',
        ),
      };
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
        groundedness: groundedness?.map((item) => ({
          ...item,
          score: Number(item.score) * 10,
        })), // To turn into a hundred

        status: 'complete',
      };
    } catch (error) {
      messages.inspectedAnswer.status = 'error';
      globalStore.state.alert = {
        type: 'error',
        text: i18n.global.t('router.monitoring.error_loading_messages'),
      };
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

  async function rateAnswer({ is_approved }) {
    try {
      const response = await nexusaiAPI.router.monitoring.messages.rateAnswer({
        projectUuid: connectProjectUuid.value,
        id: messages.inspectedAnswer.id,
        is_approved,
      });

      messages.inspectedAnswer.is_approved = response.is_approved;
    } catch (error) {
      throw new Error(error);
    }
  }

  function createNewMessage({ message }) {
    messages.newMessages.push(message);
  }

  return {
    messages,
    loadMessages,
    loadMessageContext,
    loadMessageDetails,
    loadMessagesPerformance,
    rateAnswer,
    createNewMessage,
  };
});
