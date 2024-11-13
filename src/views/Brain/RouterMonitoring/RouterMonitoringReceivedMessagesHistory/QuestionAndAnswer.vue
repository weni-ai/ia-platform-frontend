<template>
  <section class="question-and-answer">
    <template v-if="isLoading">
      <UnnnicSkeletonLoading
        class="question-and-answer__skeleton-question"
        tag="div"
        width="100%"
        height="60px"
      />
      <UnnnicSkeletonLoading
        class="question-and-answer__skeleton-answer"
        tag="div"
        width="100%"
        height="60px"
      />
    </template>
    <template v-else>
      <p
        :class="[
          'question-and-answer__message',
          'question-and-answer__question',
        ]"
      >
        {{ inspectionData.text }}
      </p>

      <section
        v-if="inspectionData.llm.status === 'action'"
        class="question-and-answer__action-started"
      >
        <UnnnicIcon
          icon="bolt"
          size="sm"
          scheme="neutral-cloudy"
        />
        <UnnnicIntelligenceText
          color="neutral-cloudy"
          family="secondary"
          size="body-md"
          tag="p"
        >
          {{
            $t('router.monitoring.activated_the_action', {
              action: inspectionData.action?.name,
            })
          }}
        </UnnnicIntelligenceText>
      </section>
      <p
        v-else
        :class="[
          'question-and-answer__message',
          'question-and-answer__answer',
          `question-and-answer__answer--${inspectionData.llm.status}`,
        ]"
      >
        {{ inspectionData.llm.response }}
      </p>
    </template>
  </section>
</template>

<script setup>
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: true,
  },

  inspectionData: {
    type: Object,
    default: () => {},
  },
});
</script>

<style lang="scss" scoped>
.question-and-answer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(auto, 1fr);
  gap: $unnnic-spacing-xs;

  &__question,
  &__skeleton-question {
    grid-column: 1 / span 2;
    grid-row: 1;
  }

  &__answer,
  &__skeleton-answer {
    grid-column: 2 / span 2;
    grid-row: 2;
  }

  &__message {
    height: fit-content;
    width: fit-content;

    border-radius: $unnnic-border-radius-sm;

    padding: $unnnic-spacing-ant;

    background-color: $unnnic-color-neutral-light;

    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
  }

  &__question {
    font-weight: $unnnic-font-weight-bold;
  }

  &__answer {
    justify-self: flex-end;

    &--success,
    &--action {
      color: $unnnic-color-neutral-white;
      background-color: $unnnic-color-weni-600;
    }

    &--failed {
      color: $unnnic-color-neutral-darkest;
      background-color: $unnnic-color-aux-red-100;
    }
  }

  &__action-started {
    grid-column: 1 / 4;
    grid-row: 2;

    display: flex;
    justify-content: center;
    align-items: center;
    gap: $unnnic-spacing-nano;
  }
}
</style>
