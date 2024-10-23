import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';

import nexusaiAPI from '@/api/nexusaiAPI.js';
import globalStore from '.';

export const useMonitoringStore = defineStore('monitoring', () => {
  const connectProjectUuid = computed(
    () => globalStore.state.Auth.connectProjectUuid,
  );

  const messages = reactive({
    status: null,
    data: [],
    count: 0,
  });

  async function loadMessages({ page, pageInterval, tag, text, started_day }) {
    try {
      messages.status = 'loading';

      const { data, count } = await nexusaiAPI.router.monitoring.messages.list({
        projectUuid: connectProjectUuid.value,
        page,
        pageInterval,
        tag,
        text,
        started_day,
      });

      messages.data = data;
      messages.count = count;
      messages.status = 'complete';
    } catch (error) {
      messages.status = 'error';
    }
  }

  return {
    messages,
    loadMessages,
  };
});
