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
        iconLeft="search"
        :placeholder="$t('router.monitoring.search_message')"
      />
      <UnnnicSelectSmart
        v-model="selectedFilter"
        :options="filters"
      />
    </section>
  </section>
</template>

<script setup>
import i18n from '@/utils/plugins/i18n';
import { ref } from 'vue';

const filters = ref([
  {
    value: 'all',
    label: i18n.global.t('router.monitoring.filters.all_messages'),
  },
  {
    value: 'success',
    label: i18n.global.t('router.monitoring.filters.answers_found'),
  },
  {
    value: 'failed',
    label: i18n.global.t('router.monitoring.filters.answers_not_found'),
  },
  {
    value: 'action',
    label: i18n.global.t(
      'router.monitoring.filters.messages_that_trigger_actions',
    ),
  },
]);

const selectedFilter = ref([filters.value[0]]);
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
}
</style>
