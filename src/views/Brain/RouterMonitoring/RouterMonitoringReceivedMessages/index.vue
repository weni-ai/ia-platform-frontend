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

    <section class="received-messages__content">
      <NewMessages
        v-if="monitoringStore.messages.newMessages.length"
        data-test="new-messages-button"
        @load="getNewMessages"
      />

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
            'table__list--history-opened': inspectedAnswerId,
          }"
          data-test="messages-table"
          :headers="table.headers"
          :rows="formattedMessagesRows"
          :paginationTotal="monitoringStore.messages.count"
          :paginationInterval="paginationInterval"
          :isLoading="isTableLoading"
          @row-click="handleRowClick"
        />

        <ReceivedMessagesHistory class="table__history" />
      </section>
    </section>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { debounce } from 'lodash';
import Unnnic from '@weni/unnnic-system';
import { format } from 'date-fns';

import { useMonitoringStore } from '@/store/Monitoring';

import NewMessages from './NewMessages.vue';
import ReceivedMessagesHistory from '../RouterMonitoringReceivedMessagesHistory/index.vue';

import i18n from '@/utils/plugins/i18n';

const route = useRoute();
const monitoringStore = useMonitoringStore();
const t = (key) => i18n.global.t(key);

const tags = computed(() => [
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
        `${format(new Date(created_at), 'dd/MM/yyyy')}, ${format(new Date(created_at), 'HH:mm')}`,
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

  monitoringStore.messages.inspectedAnswer = {};

  monitoringStore.loadMessages({
    page: pagination.value,
    pageInterval: paginationInterval.value,
    tag: tagString === 'all' ? '' : tagString,
    text,
  });
}

function filterRequestMessages() {
  if (pagination.value !== 1) {
    pagination.value = 1;
    return;
  }

  getReceivedMessages();
}

function getNewMessages() {
  pagination.value = 1;
  monitoringStore.messages.inspectedAnswer = {};
  resetFilters(); // the request for new messages is made from the filter watch
}

function resetFilters() {
  filters.value = {
    text: '',
    tag: [tags.value[0]],
  };
}

const inspectedAnswerId = computed(
  () => monitoringStore.messages.inspectedAnswer.id,
);
const inspectedAnswerIndex = computed(() =>
  monitoringStore.messages.data.findIndex(
    (message) => message.id === inspectedAnswerId.value,
  ),
);

function handleRowClick(row) {
  monitoringStore.messages.inspectedAnswer.id = row.id;
}

function highlightRow(index) {
  const rowsElements = document.querySelectorAll(
    '.unnnic-table-next__body-row',
  );

  rowsElements.forEach((row) => {
    row.style.backgroundColor = '';
  });

  if (rowsElements[index]) {
    const UNNNIC_COLOR_WENI_100 = '#C6FFF7';
    rowsElements[index].style.backgroundColor = UNNNIC_COLOR_WENI_100;
  }
}

watch(
  () => route.query,
  () => getReceivedMessages(),
  {
    immediate: true,
  },
);

watch(inspectedAnswerIndex, (newIndex) => {
  highlightRow(newIndex);
});

watch(pagination, () => getReceivedMessages());

watch(
  () => i18n.global.locale,
  () => {
    filters.value.tag = [tags.value[0]];
  },
);

watch(
  () => filters.value.tag,
  () => filterRequestMessages(),
);

watch(
  () => filters.value.text,
  debounce(() => {
    filterRequestMessages();
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

  .received-messages__content {
    min-height: 100%;
  }

  .received-messages__table {
    height: 100%;
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
      :deep(.unnnic-table-next__body) {
        > * {
          border-color: $unnnic-color-neutral-cleanest;
        }
      }

      &--history-opened {
        min-height: 25vh;
        height: 100%;

        overflow: hidden;

        :deep(.unnnic-table-next__body) {
          height: 100%;

          border: $unnnic-border-width-thinner solid
            $unnnic-color-neutral-cleanest;
          border-radius: $unnnic-border-radius-sm;
        }
        :deep(.unnnic-table-next__body-row) {
          width: 50%;
          border: 0;
          border-radius: 0;

          border-bottom: $unnnic-border-width-thinner solid
            $unnnic-color-neutral-cleanest;

          &:last-of-type {
            margin-bottom: -$unnnic-border-width-thinner;
          }
        }
      }
    }

    .table__history {
      $paginationButtonHeight: 38px;

      border-left: $unnnic-border-width-thinner solid
        $unnnic-color-neutral-cleanest;

      position: absolute;
      right: 0;
      top: 0;
      width: 50%;

      height: calc(100% - $unnnic-spacing-lg - $paginationButtonHeight);
    }
  }
}
</style>
