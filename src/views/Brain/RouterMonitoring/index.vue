<template>
  <section class="router-monitoring">
    <UnnnicDivider
      ySpacing="md"
      class="router-monitoring__divider"
    />

    <RouterMonitoringPerformance />

    <RouterMonitoringReceivedMessages />
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
  grid-template-rows: auto auto 1fr;
  gap: $unnnic-spacing-md;

  .router-monitoring__divider {
    margin: 0;
  }
}
</style>
