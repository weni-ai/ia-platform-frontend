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
      :rows="
        table.rows.map((row) => ({
          ...row,
          content: [row.content[0], formatTimeSince(row.content[1])],
        }))
      "
      :paginationTotal="125"
      :paginationInterval="5"
    />
  </section>
</template>

<script setup>
import { ref, watch } from 'vue';
import i18n from '@/utils/plugins/i18n.js';

const pagination = ref(1);

const table = ref({
  headers: [
    { content: i18n.global.t('router.tunings.history.fields.change'), size: 6 },
    { content: i18n.global.t('router.tunings.history.fields.date') },
  ],
  rows: [
    {
      content: [
        'Jade Demettino adicionou um conteúdo (lhamas_final_v3.txt)',
        '2024-09-04T18:39:40.554317Z',
      ],
    },
    {
      content: [
        'Jade Demettino removeu um conteúdo (lhamas_final_v2.txt)',
        '2024-09-04T20:40:19.740924Z',
      ],
    },
    {
      content: [
        'Mardone Silva adicionou uma ação (Despedida)',
        '2024-09-04T20:40:19.740924Z',
      ],
    },
    {
      content: [
        'Mardone Silva adicionou uma ação (Cumprimento)',
        '2024-09-04T20:40:19.740924Z',
      ],
    },
    {
      content: [
        'Mardone Silva alterou a personalidade (Generoso)',
        '2024-09-04T20:40:19.740924Z',
      ],
    },
  ],
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

const currentFilterOption = ref([filterOptions[0].value]);

watch(currentFilterOption, (newVal) => {
  console.log('Filtro alterado para:', newVal);
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
