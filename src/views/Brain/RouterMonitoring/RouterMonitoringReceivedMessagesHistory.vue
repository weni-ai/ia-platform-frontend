<template>
  <section class="received-messages-history">
    <header class="received-messages-history__header">
      <UnnnicIntelligenceText
        color="neutral-clean"
        family="secondary"
        size="body-md"
        tag="p"
      >
        URN of Contact
      </UnnnicIntelligenceText>
      <UnnnicIcon
        icon="close"
        size="avatar-nano"
        scheme="neutral-darkest"
        clickable
        @click="$emit('close')"
      />
    </header>
    <section class="received-messages-history__messages">
      <button class="button-load-previous">
        <UnnnicIcon
          icon="refresh"
          size="xs"
          scheme="neutral-cloudy"
          clickable
        />
        <UnnnicIntelligenceText
          color="neutral-cloudy"
          family="secondary"
          size="body-md"
          tag="p"
        >
          {{ $t('router.monitoring.load_previous_messages') }}
        </UnnnicIntelligenceText>
      </button>
    </section>
  </section>
</template>

<script setup>
import { useMonitoringStore } from '@/store/Monitoring';
import { onMounted } from 'vue';

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
});

defineEmits(['close']);

const monitoringStore = useMonitoringStore();

onMounted(() => {
  monitoringStore.loadMessagesHistory({ id: props.id });
});
</script>

<style lang="scss" scoped>
.received-messages-history {
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-xs;

  &__header {
    border-bottom: $unnnic-border-width-thinner solid
      $unnnic-color-neutral-cleanest;

    padding: $unnnic-spacing-ant $unnnic-spacing-sm;

    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $unnnic-spacing-xs;
  }

  &__messages {
    padding: $unnnic-spacing-ant $unnnic-spacing-sm;

    .button-load-previous {
      border: none;
      background: none;

      margin: auto;

      display: flex;
      gap: $unnnic-spacing-nano;
      justify-content: center;
      align-items: center;

      cursor: pointer;
    }
  }
}
</style>
