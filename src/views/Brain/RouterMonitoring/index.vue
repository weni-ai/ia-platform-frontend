<template>
  <section class="router-monitoring">
    <UnnnicIntelligenceText
      tag="p"
      family="secondary"
      size="body-gt"
    >
      {{ $t('router.monitoring.description') }}
    </UnnnicIntelligenceText>

    <UnnnicDivider ySpacing="md" />

    <section class="router-monitoring__content">
      <RouterMonitoringPerformance />

      <RouterMonitoringReceivedMessages />
    </section>
  </section>
</template>

<script>
import RouterMonitoringPerformance from './RouterMonitoringPerformance.vue';
import RouterMonitoringReceivedMessages from './RouterMonitoringReceivedMessages.vue';

export default {
  components: {
    RouterMonitoringPerformance,
    RouterMonitoringReceivedMessages,
  },
};
</script>

<style lang="scss" scoped>
section.router-monitoring {
  display: grid;

  &__content {
    display: grid;
    gap: $unnnic-spacing-md;
  }
}
</style>
