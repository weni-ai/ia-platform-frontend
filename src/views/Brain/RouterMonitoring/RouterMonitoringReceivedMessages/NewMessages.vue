<template>
  <button
    class="router-monitoring-new-messages"
    data-testid="load-new-messages-button"
    @click="$emit('load')"
  >
    {{
      $t('router.monitoring.new_messages_load', messagesLength, {
        n: messagesLength,
      })
    }}
  </button>
</template>

<script setup>
import { useMonitoringStore } from '@/store/Monitoring';
import { computed } from 'vue';

defineEmits(['load']);

const monitoringStore = useMonitoringStore();
const messagesLength = computed(
  () => monitoringStore.messages.newMessages.length,
);
</script>

<style scoped lang="scss">
.router-monitoring-new-messages {
  border: none;
  border-radius: $unnnic-border-radius-sm $unnnic-border-radius-sm 0 0;

  padding: $unnnic-spacing-ant $unnnic-spacing-sm;

  background: $unnnic-color-weni-100;

  width: 100%;

  color: $unnnic-color-weni-700;
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  text-align: center;
  white-space: nowrap;

  cursor: pointer;
}
</style>
