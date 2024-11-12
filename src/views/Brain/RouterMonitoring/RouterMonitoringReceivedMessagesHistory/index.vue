<template>
  <section class="received-messages-history">
    <header class="received-messages-history__header">
      <UnnnicIntelligenceText
        class="header__urn"
        color="neutral-clean"
        family="secondary"
        size="body-md"
        tag="p"
      >
        {{ inspectedAnswer.contact_urn }}
      </UnnnicIntelligenceText>
      <UnnnicIcon
        icon="close"
        size="avatar-nano"
        scheme="neutral-darkest"
        clickable
        @click="close"
      />
    </header>
    <section class="received-messages-history__messages">
      <button
        v-if="!isLoadingMessages"
        class="button-load-previous"
      >
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

      <QuestionAndAnswer
        :isLoading="isLoadingMessages"
        :inspectionData="inspectedAnswer"
      />
    </section>
  </section>
</template>

<script setup>
import { useMonitoringStore } from '@/store/Monitoring';
import { computed, watch } from 'vue';
import QuestionAndAnswer from './QuestionAndAnswer.vue';
import { emit } from 'iframessa';

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
});

defineEmits(['close']);

const monitoringStore = useMonitoringStore();
const inspectedAnswer = computed(
  () => monitoringStore.messages.inspectedAnswer,
);
const isLoadingMessages = computed(
  () => inspectedAnswer.value.status === 'loading',
);

function loadMessagesHistory() {
  monitoringStore.loadMessagesHistory({ id: props.id });
}

function close() {
  emit('close');
  monitoringStore.messages.inspectedAnswer = null;
}

watch(
  () => props.id,
  () => loadMessagesHistory(),
  {
    immediate: true,
  },
);
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

    .header__urn {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__messages {
    padding: $unnnic-spacing-ant $unnnic-spacing-sm;

    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-xs;

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
