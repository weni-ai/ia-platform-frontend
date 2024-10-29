<template>
  <section class="router-monitoring__received-messages">
    <UnnnicIntelligenceText
      data-test="title"
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
        data-test="filter-text"
      />
      <UnnnicSelectSmart
        v-model="filters.tag"
        :options="tags"
        orderedByIndex
        data-test="filter-tag"
      />
    </section>

    <UnnnicIntelligenceText
      v-if="showNoMessageReceivedInfo"
      data-test="no-message-received"
      color="neutral-clean"
      family="secondary"
      size="body-gt"
      tag="p"
    >
      {{ $t('router.monitoring.no_message_received') }}
    </UnnnicIntelligenceText>
    <UnnnicTableNext
      v-else
      v-model:pagination="pagination"
      hideHeaders
      class="received-messages__table"
      data-test="messages-table"
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
import { useRoute } from 'vue-router';
import { debounce } from 'lodash';

const ANSWERS_FOUND = i18n.global.t('router.monitoring.filters.answers_found');
const ANSWERS_NOT_FOUND = i18n.global.t(
  'router.monitoring.filters.answers_not_found',
);
const MESSAGES_TRIGGER_ACTIONS = i18n.global.t(
  'router.monitoring.filters.messages_that_trigger_actions',
);

const route = useRoute();
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
    value: 'action_started',
    label: MESSAGES_TRIGGER_ACTIONS,
  },
]);
const filters = ref({
  text: '',
  tag: [tags.value[0]],
});

const table = ref({
  headers: [
    { content: '', size: 'auto' },
    { content: '' },
    { content: '', size: 'auto' },
  ],
  rows: [],
});
const pagination = ref(1);
const paginationInterval = ref(15);
const isTableLoading = computed(
  () => monitoringStore.messages.status === 'loading',
);

const showNoMessageReceivedInfo = computed(
  () =>
    monitoringStore.messages.count === 0 &&
    filters.value.tag[0].value === 'all' &&
    !filters.value.text &&
    !isTableLoading.value,
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
    action_started: {
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

function getReceivedMessages() {
  const { tag, text } = filters.value;
  const tagString = tag[0].value;
  monitoringStore.loadMessages({
    page: pagination.value,
    pageInterval: paginationInterval.value,
    tag: tagString === 'all' ? '' : tagString,
    text,
  });
}

watch(
  () => route.query,
  () => getReceivedMessages(),
  {
    immediate: true,
  },
);

watch(pagination, () => getReceivedMessages());

watch(
  () => filters.value.tag,
  () => getReceivedMessages(),
);

watch(
  () => filters.value.text,
  debounce(() => {
    getReceivedMessages();
  }, 300),
);
</script>

<style lang="scss" scoped>
.router-monitoring__received-messages {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  .received-messages__filters {
    display: grid;
    grid-template-columns: 9fr 3fr;
    gap: $unnnic-spacing-sm;
  }

  .received-messages__table {
    :deep(.unnnic-table-next__body-row) {
      $body-cell: '.unnnic-table-next__body-cell';

      &:has(#{$body-cell} + #{$body-cell}) {
        #{$body-cell}:first-child {
          color: $unnnic-color-neutral-clean;
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
