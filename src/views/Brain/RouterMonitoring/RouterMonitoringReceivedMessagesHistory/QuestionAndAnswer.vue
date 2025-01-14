<template>
  <section class="question-and-answer">
    <template v-if="isLoading">
      <UnnnicSkeletonLoading
        data-testid="skeleton-question"
        class="question-and-answer__skeleton-question"
        tag="div"
        width="100%"
        height="60px"
      />
      <UnnnicSkeletonLoading
        data-testid="skeleton-answer"
        class="question-and-answer__skeleton-answer"
        tag="div"
        width="100%"
        height="60px"
      />
    </template>
    <template v-else>
      <Markdown
        data-testid="question"
        :class="[
          'question-and-answer__message',
          'question-and-answer__question',
        ]"
        :content="data.text"
      />

      <section
        v-if="data.llm.status === 'action'"
        class="question-and-answer__action-started"
        data-testid="action"
      >
        <section class="action-started__text">
          <UnnnicIcon
            data-testid="action-icon"
            icon="bolt"
            size="sm"
            scheme="neutral-cloudy"
          />
          <UnnnicIntelligenceText
            data-testid="action-name"
            color="neutral-cloudy"
            family="secondary"
            size="body-md"
            tag="p"
          >
            {{
              $t('router.monitoring.activated_the_action', {
                action: data.action?.name,
              })
            }}
          </UnnnicIntelligenceText>
        </section>
        <UnnnicButton
          class="action-started__inspect-response"
          data-testid="inspect-response-action"
          size="small"
          :text="$t('router.monitoring.inspect_response.inspect')"
          type="secondary"
          iconLeft="info"
          @click="isDrawerInspectAnswerOpen = true"
        />
      </section>
      <section
        v-else
        class="question-and-answer__answer"
      >
        <Markdown
          data-testid="answer"
          :class="[
            'question-and-answer__message',
            'question-and-answer__answer-text',
            `question-and-answer__answer-text--${data.llm.status}`,
          ]"
          :content="data.llm.response"
        />

        <UnnnicButton
          class="answer__inspect-response"
          data-testid="inspect-response"
          size="small"
          :text="$t('router.monitoring.inspect_response.title')"
          type="secondary"
          iconLeft="info"
          @click="isDrawerInspectAnswerOpen = true"
        />
      </section>
      <DrawerInspectAnswer
        v-model="isDrawerInspectAnswerOpen"
        data-testid="drawer-inspect-response"
        :inspectionData="data"
      />
    </template>
  </section>
</template>

<script setup>
import { ref } from 'vue';

import DrawerInspectAnswer from '@/components/Brain/Monitoring/DrawerInspectResponse/index.vue';
import Markdown from '@/components/Markdown.vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: true,
  },

  data: {
    type: Object,
    required: true,
  },
});

const isDrawerInspectAnswerOpen = ref(false);
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

    border-radius: $unnnic-border-radius-md;

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
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: $unnnic-spacing-nano;
    width: fit-content;
    justify-self: end;

    &-text {
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

    .answer__inspect-response {
      width: 100%;
    }
  }

  &__action-started {
    grid-column: 1 / 4;
    grid-row: 2;

    display: grid;
    grid-template-columns: repeat(4, 1fr);
    row-gap: $unnnic-spacing-xs;

    .action-started__text {
      grid-column: 1 / 5;
      grid-row: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: $unnnic-spacing-nano;
    }

    .action-started__inspect-response {
      grid-column: 2 / 4;
      grid-row: 2;
    }
  }
}
</style>
