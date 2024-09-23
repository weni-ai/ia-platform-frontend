<template>
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
  <section>
    <UnnnicTableNext
      v-model:pagination="pagination"
      :headers="table.headers"
      :rows="formattedRows"
      :paginationTotal="paginationTotal"
      :paginationInterval="paginationInterval"
      :isLoading="isLoading"
      class="table"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import i18n from '@/utils/plugins/i18n.js';
import nexusaiAPI from '@/api/nexusaiAPI';
import HistoryItem from './HistoryItem.vue';
import { useStore } from 'vuex';
import HistoryData from './HistoryData.vue';

const store = useStore();

const pagination = ref(1);
const paginationTotal = ref(0);
const paginationInterval = ref(10);
const isLoading = ref(false);

const isCollapsedMap = ref({});

const table = ref({
  headers: [
    { content: i18n.global.t('router.tunings.history.fields.change'), size: 5 },
    { content: i18n.global.t('router.tunings.history.fields.date') },
  ],
  rows: [],
});

const filterOptions = [
  {
    value: '1',
    label: i18n.global.t('router.tunings.history.fields.all-changes'),
  },
  {
    value: '2',
    label: i18n.global.t('router.tunings.history.fields.customization-changes'),
  },
  {
    value: '3',
    label: i18n.global.t('router.tunings.history.fields.content-changes'),
  },
  {
    value: '4',
    label: i18n.global.t('router.tunings.history.fields.actions-changes'),
  },
  {
    value: '5',
    label: i18n.global.t('router.tunings.history.fields.settings-changes'),
  },
];

const currentFilterOption = ref(filterOptions[0].value.value);

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

const fetchData = async (page = 1) => {
  isLoading.value = true;
  try {
    const { data } = await nexusaiAPI.router.tunings.historyChanges.read({
      projectUuid: store.state.Auth.connectProjectUuid,
      pageSize: paginationInterval.value,
      page,
    });
    table.value.rows = data.results;
    paginationTotal.value = data.count;
    console.log('fetchData', page, data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

watch(pagination, (newPage) => {
  fetchData(newPage);
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

function handleChangeName(row) {
  if (!row.model_group && row.action_details['brain_on']) {
    const statusBrain = JSON.parse(
      row.action_details['brain_on'].new.toLowerCase(),
    )
      ? 'on'
      : 'off';

    return {
      icon: 'settings',
      user: row.created_by,
      text:
        i18n.global.t(`router.tunings.history.fields.brain-${statusBrain}`) ||
        '-',
    };
  }

  if (!row || !row.model_group || !row.action_type || !row.action_details) {
    return {
      icon: 'article',
      user: '-',
      text: '-',
    };
  }

  const action_details = Object.keys(row.action_details).map((key) => {
    return {
      key: key,
      newValue: row.action_details[key]?.new,
      oldValue: row.action_details[key]?.old,
    };
  });

  const actionUpdateName =
    action_details[0]?.key === 'name' ? 'name' : 'prompt';

  const ActionUpdate =
    action_details.length > 1 && action_details[0] !== 'new'
      ? i18n.global.t(`router.tunings.history.fields.changes`, {
          value: action_details.length,
        })
      : i18n.global.t(
          `router.tunings.history.fields.update-${actionUpdateName}-action`,
          {
            value: action_details[0]?.newValue,
          },
        ) || '-';

  const CustomizationUpdate =
    action_details.length > 1 && action_details[0] !== 'new'
      ? i18n.global.t(`router.tunings.history.fields.changes`, {
          value: action_details.length,
        })
      : action_details[0]
        ? i18n.global.t(
            `router.tunings.history.fields.update-${action_details[0]?.key}`,
            {
              value: action_details[0]?.newValue,
            },
          )
        : i18n.global.t(`router.tunings.history.fields.changes`);

  const groupData = {
    Action: {
      C: {
        icon: 'bolt',
        user: row.created_by,
        text:
          i18n.global.t('router.tunings.history.fields.add-action', {
            value: row.action_details.new,
          }) || '-',
      },
      U: {
        icon: 'bolt',
        user: row.created_by,
        text: ActionUpdate,
        groupText:
          action_details.length > 1 &&
          !['new', 'old'].includes(action_details.map((e) => e.key))
            ? action_details.map((e) =>
                i18n.global.t(
                  `router.tunings.history.fields.update-${e.key}-action`,
                  {
                    value: e.newValue,
                  },
                ),
              )
            : [],
      },
      D: {
        icon: 'bolt',
        user: row.created_by,
        text:
          i18n.global.t('router.tunings.history.fields.remove-action', {
            value: row.action_details.old,
          }) || '-',
      },
    },
    Config: {
      U: {
        icon: 'settings',
        user: row.created_by,
        text:
          i18n.global.t('router.tunings.history.fields.update-model') || '-',
      },
    },
    Content: {
      D: {
        icon: 'article',
        user: row.created_by,
        text:
          i18n.global.t('router.tunings.history.fields.remove-content', {
            value: row.action_details.new,
          }) || '-',
      },
      U: {
        icon: 'article',
        user: row.created_by,
        text:
          i18n.global.t('router.tunings.history.fields.update-content', {
            value: row.action_details.new,
          }) || '-',
      },
      C: {
        icon: 'article',
        user: row.created_by,
        text:
          i18n.global.t('router.tunings.history.fields.add-content', {
            value: row.action_details.new,
          }) || '-',
      },
    },
    Customization: {
      U: {
        icon: 'person',
        user: row.created_by,
        text: CustomizationUpdate,
        groupText:
          action_details.length > 1 &&
          !['new', 'old'].includes(action_details.map((e) => e.key))
            ? action_details.map((e) =>
                i18n.global.t(`router.tunings.history.fields.update-${e.key}`, {
                  value: e.newValue,
                }),
              )
            : [],
      },
    },
  };

  return groupData[row.model_group]?.[row.action_type];
}
</script>

<style scoped lang="scss">
.changes-history {
  &__container {
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: $unnnic-spacing-md;
      column-gap: $unnnic-spacing-sm;
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
