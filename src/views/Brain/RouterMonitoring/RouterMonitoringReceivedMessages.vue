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
    <section
      v-else
      :class="{
        'received-messages__table': true,
        'received-messages__table--with-results':
          !isTableLoading && formattedMessagesRows.length,
      }"
    >
      <UnnnicTableNext
        v-model:pagination="pagination"
        hideHeaders
        :class="{
          table__list: true,
          'table__list--history-opened': receivedMessageHistoryId,
        }"
        data-test="messages-table"
        :headers="table.headers"
        :rows="formattedMessagesRows"
        :paginationTotal="monitoringStore.messages.count"
        :paginationInterval="paginationInterval"
        :isLoading="isTableLoading"
        @row-click="handleRowClick"
      />

      <ReceivedMessagesHistory
        v-if="receivedMessageHistoryId"
        :id="receivedMessageHistoryId"
        class="table__history"
        @close="receivedMessageHistoryId = ''"
      />
    </section>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import Unnnic from '@weni/unnnic-system';
import { format } from 'date-fns';
import { useRoute } from 'vue-router';
import { debounce } from 'lodash';

import { useMonitoringStore } from '@/store/Monitoring';

import ReceivedMessagesHistory from './RouterMonitoringReceivedMessagesHistory/index.vue';

import i18n from '@/utils/plugins/i18n';

const route = useRoute();
const monitoringStore = useMonitoringStore();
const t = (key) => i18n.global.t(key);

const tags = ref([
  {
    value: 'all',
    label: t('router.monitoring.filters.all_messages'),
  },
  {
    value: 'success',
    label: t('router.monitoring.filters.answers_found'),
  },
  {
    value: 'failed',
    label: t('router.monitoring.filters.answers_not_found'),
  },
  {
    value: 'action_started',
    label: t('router.monitoring.filters.messages_that_trigger_actions'),
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
  const getMessageTagProps = (
    type,
    action_name = t('router.monitoring.action.title'),
  ) => {
    if (type === 'success') {
      return {
        scheme: 'aux-green-500',
        leftIcon: 'check_circle',
        text: t('router.monitoring.success.title'),
      };
    }
    if (type === 'failed') {
      return {
        scheme: 'aux-red-500',
        leftIcon: 'cancel',
        text: t('router.monitoring.failed.title'),
      };
    }
    if (type === 'action_started') {
      return {
        scheme: 'aux-blue-500',
        leftIcon: 'bolt',
        text: action_name,
      };
    }
  };

  return monitoringStore.messages.data.map(
    ({ created_at, text, tag, action_name, id }) => ({
      content: [
        format(created_at, 'HH:mm'),
        text,
        {
          component: Unnnic.unnnicTag,
          props: {
            type: 'default',
            ...getMessageTagProps(tag.toLowerCase(), action_name),
          },
          events: {},
        },
      ],
      id,
    }),
  );
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

const receivedMessageHistoryId = ref('');

function handleRowClick(row) {
  receivedMessageHistoryId.value = row.id;
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
    position: relative;

    :deep(.unnnic-table-next__body-row) {
      $body-cell: '.unnnic-table-next__body-cell';

      &:has(#{$body-cell} + #{$body-cell}) {
        #{$body-cell}:first-child {
          color: $unnnic-color-neutral-clean;
        }
        #{$body-cell}:nth-child(2) {
          padding: $unnnic-spacing-ant 0;
          margin: 0 -$unnnic-spacing-xs;
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

    &--with-results {
      :deep(.unnnic-table-next__body-row):hover {
        background-color: $unnnic-color-weni-100;

        cursor: pointer;
      }
    }

    .table__list {
      &--history-opened {
        overflow: hidden;
        :deep(.unnnic-table-next__body) {
          border: $unnnic-border-width-thinner solid
            $unnnic-color-neutral-cleanest;
          border-radius: $unnnic-border-radius-sm;
        }
        :deep(.unnnic-table-next__body-row) {
          width: 50%;
          border-left: 0;
          border-radius: 0;

          &:first-of-type {
            border-top: 0;
          }

          &:last-of-type {
            border-bottom: 0;
          }
        }
      }
    }

    .table__history {
      $paginationButtonHeight: 38px;

      position: absolute;
      right: 0;
      top: 0;
      width: 50%;
      height: calc(100% - $unnnic-spacing-lg - $paginationButtonHeight);
    }
  }
}
</style>
