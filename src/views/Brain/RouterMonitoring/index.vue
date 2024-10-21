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

    <RouterMonitoringPerformance />
  </section>
</template>

<script>
import RouterMonitoringPerformance from './RouterMonitoringPerformance.vue';

export default {
  components: {
    RouterMonitoringPerformance,
  },
};
</script>

<style lang="scss" scoped>
.router-monitoring {
}
</style>
