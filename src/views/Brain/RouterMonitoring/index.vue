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

<script setup>
import WS from '@/websocket/setup';

import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

import RouterMonitoringPerformance from './RouterMonitoringPerformance.vue';
import RouterMonitoringReceivedMessages from './RouterMonitoringReceivedMessages.vue';

const ws = ref(null);
const store = useStore();
const auth = computed(() => store.state.Auth);

onMounted(() => {
  ws.value = new WS({
    project: auth.value.connectProjectUuid,
    token: auth.value.token.replace('Bearer ', ''),
  });
  ws.value.connect();
});
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
