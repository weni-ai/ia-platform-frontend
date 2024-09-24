<template>
  <p
    v-if="noChangesDetected"
    class="changes-history__no-changes"
  >
    {{ $t('router.tunings.history.no_changes') }}
  </p>
  <template v-else>
    <section class="changes-history__container__header">
      <section>
        <UnnnicIntelligenceText
          color="neutral-cloudy"
          family="secondary"
          size="body-gt"
          tag="p"
        >
          {{ $t('router.tunings.history.description') }}
        </UnnnicIntelligenceText>
        <UnnnicIntelligenceText
          class="text-sub-description"
          color="neutral-clean"
          family="secondary"
          size="body-md"
          tag="p"
        >
          {{ $t('router.tunings.history.sub_description') }}
        </UnnnicIntelligenceText>
      </section>

      <UnnnicSelectSmart
        v-model:modelValue="currentFilterOption"
        class="select-filter"
        :options="filterOptions"
        orderedByIndex
      />
    </section>
    <UnnnicTableNext
      v-model:pagination="pagination"
      :headers="table.headers"
      :rows="formattedRows"
      :paginationTotal="paginationTotal"
      :paginationInterval="paginationInterval"
      :isLoading="isLoading"
      class="changes-history__table"
    />
  </template>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import i18n from '@/utils/plugins/i18n.js';
import nexusaiAPI from '@/api/nexusaiAPI';
import HistoryItem from './HistoryItem.vue';
import { useStore } from 'vuex';
import HistoryData from './HistoryData.vue';
import { handleChangeName } from '@/utils/changeNameUtils';

const store = useStore();

const pagination = ref(1);
const paginationTotal = ref(0);
const paginationInterval = ref(10);
const isLoading = ref(false);

const isCollapsedMap = ref({});

const table = ref({
  headers: [
    { content: i18n.global.t('router.tunings.history.fields.change'), size: 3 },
    { content: i18n.global.t('router.tunings.history.fields.date') },
  ],
  rows: [],
});

const filterOptions = [
  {
    value: 'all',
    label: i18n.global.t('router.tunings.history.fields.all-changes'),
  },
  {
    value: 'Customization',
    label: i18n.global.t('router.tunings.history.fields.customization-changes'),
  },
  {
    value: 'Content',
    label: i18n.global.t('router.tunings.history.fields.content-changes'),
  },
  {
    value: 'Action',
    label: i18n.global.t('router.tunings.history.fields.actions-changes'),
  },
  {
    value: 'Config',
    label: i18n.global.t('router.tunings.history.fields.settings-changes'),
  },
];

const currentFilterOption = ref(filterOptions[0].value.value);

const noChangesDetected = computed(() => {
  const noRows = table.value.rows.length === 0;
  const isAllFilterSelected = currentFilterOption.value?.[0].value === 'all';

  return noRows && isAllFilterSelected && !isLoading.value;
});

const formattedRows = computed(() =>
  table.value.rows.map((row, index) => ({
    ...row,
    content: [
      {
        component: HistoryItem,
        props: {
          ...handleChangeName(row),
          isRenderGroupText: isCollapsedMap.value[index] || false,
        },
        events: {},
      },
      {
        component: HistoryData,
        props: {
          text: formatTimeSince(row.created_at),
          isRenderIcon: handleIsRenderIcon(row),
        },
        events: {
          'update:isCollapsed': (collapsed) => {
            isCollapsedMap.value[index] = collapsed;
          },
        },
      },
    ],
  })),
);

function handleIsRenderIcon(row) {
  if (row?.model_group === 'Config') return false;

  const values = Object.keys(row?.action_details || []);

  return values.length > 1 && values[0] !== 'new';
}

const getChangesHistoryData = async (page = 1, filter = '') => {
  isLoading.value = true;
  try {
    const { data } = await nexusaiAPI.router.tunings.historyChanges.read({
      projectUuid: store.state.Auth.connectProjectUuid,
      pageSize: paginationInterval.value,
      page,
      filter: filter === 'all' ? '' : filter,
    });
    table.value.rows = data.results;
    paginationTotal.value = data.count;
  } catch (error) {
    console.error('Failed to fetch data:', error);
  } finally {
    isLoading.value = false;
  }
};

watch(pagination, (newPage) => {
  getChangesHistoryData(newPage, currentFilterOption.value[0].value);
});

watch(currentFilterOption, (option) => {
  getChangesHistoryData(1, option[0].value);
  pagination.value = 1;
});

function formatTimeSince(dateString) {
  const now = new Date();
  const createdAt = new Date(dateString);

  const diffInMinutes = Math.floor((now - createdAt) / 1000 / 60);

  if (diffInMinutes < 60) {
    return i18n.global.t('time.time_ago_minutes', { count: diffInMinutes });
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return i18n.global.t('time.time_ago_hours', { count: diffInHours });
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return i18n.global.t('time.time_ago_days', { count: diffInDays });
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return i18n.global.t('time.time_ago_months', { count: diffInMonths });
}
</script>

<style scoped lang="scss">
.changes-history {
  &__no-changes {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
  }

  &__container {
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: $unnnic-spacing-md;
      column-gap: $unnnic-spacing-sm;
    }
  }

  &__table {
    :deep(.unnnic-table-next__body-cell) {
      align-self: start;
    }
  }
}
.select-filter {
  min-width: 260px;
  :deep(.input:focus) {
    outline-color: $unnnic-color-weni-600;
    outline-width: 1.5px;
  }
}
</style>
