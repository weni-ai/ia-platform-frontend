<template>
  <section class="response-evaluator">
    <UnnnicDivider
      class="response-evaluator__divider"
      ySpacing="md"
    />

    <UnnnicIntelligenceText
      class="response-evaluator__rate-the-answer"
      color="neutral-dark"
      family="secondary"
      size="body-gt"
      tag="p"
    >
      {{ $t('router.monitoring.inspect_response.rate_the_answer') }}:
    </UnnnicIntelligenceText>

    <section class="response-evaluator__actions">
      <button
        :class="['actions__button', { 'actions__button--bold': isApproved }]"
        @click="setIsApproved(true)"
      >
        <UnnnicIcon
          icon="thumb_up"
          scheme="neutral-cloudy"
          size="sm"
          :filled="isApproved"
        />{{ $t('router.monitoring.inspect_response.i_liked') }}
      </button>
      <button
        :class="[
          'actions__button',
          { 'actions__button--bold': isApproved === false },
        ]"
        @click="setIsApproved(false)"
      >
        <UnnnicIcon
          icon="thumb_down"
          scheme="neutral-cloudy"
          size="sm"
          :filled="isApproved === false"
        />{{ $t('router.monitoring.inspect_response.i_didnt_like') }}
      </button>
    </section>
  </section>
</template>

<script setup>
import { useMonitoringStore } from '@/store/Monitoring';
import { ref } from 'vue';

const props = defineProps({
  isApproved: {
    type: [Boolean, null],
    default: null,
  },
});

const monitoringStore = useMonitoringStore();

const isApproved = ref(props.isApproved);

async function setIsApproved(boolean) {
  const oldIsApproved = isApproved.value;
  isApproved.value = boolean;

  try {
    await monitoringStore.rateAnswer({ is_approved: boolean });
  } catch (error) {
    console.log('error', error);

    isApproved.value = oldIsApproved;
  }
}
</script>

<style lang="scss" scoped>
.response-evaluator {
  display: flex;
  flex-direction: column;

  .response-evaluator__divider {
    margin-top: 0;
  }

  &__rate-the-answer {
    margin-bottom: $unnnic-spacing-xs;
  }

  &__actions {
    display: flex;
    gap: $unnnic-spacing-sm;

    .actions__button {
      padding: 0;
      border: none;
      background: none;

      cursor: pointer;

      display: flex;
      align-items: center;
      justify-content: center;
      gap: $unnnic-spacing-nano;

      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;

      &--bold {
        font-weight: $unnnic-font-weight-bold;
      }
    }
  }
}
</style>
