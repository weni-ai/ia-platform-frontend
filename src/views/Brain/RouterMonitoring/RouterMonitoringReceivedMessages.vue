<template>
  <section class="router-monitoring__received-messages">
    <UnnnicIntelligenceText
      tag="h2"
      family="secondary"
      size="body-lg"
      color="neutral-darkest"
      weight="bold"
    >
      {{ $t('router.monitoring.received_messages') }}
    </UnnnicIntelligenceText>

    <section class="received-messages__filters">
      <UnnnicInput
        v-model="filters.text"
        iconLeft="search"
        :placeholder="$t('router.monitoring.search_message')"
      />
      <UnnnicSelectSmart
        v-model="filters.tag"
        :options="tags"
      />
    </section>

    <UnnnicTableNext
      v-model:pagination="pagination"
      hideHeaders
      class="received-messages__table"
      :headers="table.headers"
      :rows="formattedMessagesRows"
      :paginationTotal="monitoringStore.messages.count"
      :paginationInterval="paginationInterval"
      :isLoading="isTableLoading"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import Unnnic from '@weni/unnnic-system';
import { format } from 'date-fns';

import { useMonitoringStore } from '@/store/Monitoring';

import i18n from '@/utils/plugins/i18n';

const ANSWERS_FOUND = i18n.global.t('router.monitoring.filters.answers_found');
const ANSWERS_NOT_FOUND = i18n.global.t(
  'router.monitoring.filters.answers_not_found',
);
const MESSAGES_TRIGGER_ACTIONS = i18n.global.t(
  'router.monitoring.filters.messages_that_trigger_actions',
);

const monitoringStore = useMonitoringStore();

const tags = ref([
  {
    value: 'all',
    label: i18n.global.t('router.monitoring.filters.all_messages'),
  },
  {
    value: 'success',
    label: ANSWERS_FOUND,
  },
  {
    value: 'failed',
    label: ANSWERS_NOT_FOUND,
  },
  {
    value: 'action',
    label: MESSAGES_TRIGGER_ACTIONS,
  },
]);
const filters = ref({
  text: '',
  tag: [tags.value[0]],
});

const table = ref({
  headers: [
    { content: '', size: 0.8 },
    { content: '', size: 8.2 },
    { content: '', size: 3 },
  ],
  rows: [],
});
const pagination = ref(1);
const paginationInterval = ref(15);
const isTableLoading = computed(
  () => monitoringStore.messages.status === 'loading',
);

const formattedMessagesRows = computed(() => {
  const tagComponentProps = {
    success: {
      scheme: 'aux-green-500',
      leftIcon: 'check_circle',
      text: ANSWERS_FOUND,
    },
    failed: {
      scheme: 'aux-red-500',
      leftIcon: 'cancel',
      text: ANSWERS_NOT_FOUND,
    },
    action: {
      scheme: 'aux-blue-500',
      leftIcon: 'bolt',
      text: MESSAGES_TRIGGER_ACTIONS,
    },
  };
  return monitoringStore.messages.data.map(({ created_at, text, tag }) => ({
    content: [
      format(created_at, 'HH:mm'),
      text,
      {
        component: Unnnic.unnnicTag,
        props: {
          type: 'default',
          ...tagComponentProps[tag.toLowerCase()],
        },
        events: {},
      },
    ],
  }));
});

const getReceivedMessages = ({ started_day = '' } = {}) => {
  const { tag, text } = filters.value;
  const tagString = tag[0].value;
  monitoringStore.loadMessages({
    page: pagination.value,
    pageInterval: paginationInterval.value,
    tag: tagString === 'all' ? '' : tagString,
    text,
    started_day,
  });
};

onMounted(() => {
  getReceivedMessages();
});

watch(pagination, () => getReceivedMessages());

watch(
  () => filters.value.tag,
  () => getReceivedMessages(),
);

watch(
  () => filters.value.text,
  () => {
    setTimeout(getReceivedMessages(), 1000);
  },
);
</script>

<style lang="scss" scoped>
.router-monitoring__received-messages {
  display: grid;
  gap: $unnnic-spacing-sm;

  .received-messages__filters {
    display: grid;
    grid-template-columns: 9fr 3fr;
    gap: $unnnic-spacing-sm;
  }

  .received-messages__table {
    :deep(.unnnic-table-next__body-row) {
      .unnnic-table-next__body-cell {
        &:first-child {
          color: $unnnic-color-neutral-clean;
        }
        &:last-child {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
    :deep(.unnnic-tag) {
      width: fit-content;
      overflow: hidden;

      .unnnic-tag__label {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
