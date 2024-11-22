<template>
  <UnnnicDrawer
    :modelValue="modelValue"
    :title="$t('router.monitoring.inspect_response.title')"
    :description="
      $t(
        'router.monitoring.inspect_response.intelligent_agent_response_details',
      )
    "
    @close="close"
  >
    <template #content>
      <section class="inspect-response">
        <section class="inspect-response__contact">
          <UnnnicIntelligenceText
            color="neutral-cloudy"
            family="secondary"
            size="body-gt"
            tag="p"
          >
            {{ $t('router.monitoring.inspect_response.contact_message') }}:
          </UnnnicIntelligenceText>
          <p class="contact__text">“{{ inspectionData.text }}”</p>
        </section>

        <section
          v-if="inspectionData.llm.status === 'action'"
          class="inspect-response__action"
        >
          <UnnnicAvatarIcon
            class="action__icon"
            size="sm"
            icon="bolt"
            scheme="aux-blue"
          />

          <p class="action__name">
            {{ inspectionData.action.name }}
          </p>
        </section>

        <section
          v-else
          class="inspect-response__agent"
        >
          <UnnnicIntelligenceText
            color="neutral-cloudy"
            family="secondary"
            size="body-gt"
            tag="p"
          >
            {{ $t('router.monitoring.inspect_response.agent_response') }}:
          </UnnnicIntelligenceText>
          <p
            v-if="inspectionData.llm.status !== 'success'"
            class="agent__text"
          >
            “{{ inspectionData.llm.response }}”
          </p>
          <section
            v-else
            class="agent__text-success"
          >
            <section class="text-success__sentences">
              <template
                v-for="fragment of groundednessFragments"
                :key="fragment.sentence"
              >
                <p
                  :class="[
                    'agent__text',
                    'text-success__text',
                    `text-success__text--${getReliabilityLevel(fragment)}`,
                  ]"
                >
                  {{ fragment.sentence }}
                </p>
              </template>
            </section>
            <section
              v-for="fragment of groundednessFragments"
              :key="fragment.sentence"
              class="text-success__groundedness"
            >
              <section class="groundedness__source">
                <span
                  :class="[
                    'source__status',
                    `source__status--${getReliabilityLevel(fragment)}`,
                  ]"
                />

                <UnnnicIntelligenceText
                  v-if="fragment.sources[0].filename"
                  class="source__filename"
                  color="neutral-dark"
                  family="secondary"
                  size="body-gt"
                  tag="p"
                >
                  {{ fragment.sources[0].filename }}
                </UnnnicIntelligenceText>
                <p
                  v-else
                  class="source__filename--not-found"
                >
                  {{ $t('router.monitoring.inspect_response.not_found') }}
                </p>

                <UnnnicIntelligenceText
                  class="source__confidence"
                  color="neutral-cloudy"
                  family="secondary"
                  size="body-gt"
                  tag="p"
                >
                  {{
                    $t(
                      'router.monitoring.inspect_response.confidence_percentage',
                      { percentage: fragment.score },
                    )
                  }}
                </UnnnicIntelligenceText>
              </section>
            </section>
          </section>
        </section>

        <ResponseEvaluator
          v-if="inspectionData.llm.status !== 'failed'"
          :isApproved="inspectionData.is_approved"
        />
      </section>
    </template>
  </UnnnicDrawer>
</template>

<script setup>
import { computed } from 'vue';

import ResponseEvaluator from './ResponseEvaluator.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },

  inspectionData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:model-value']);

const groundednessFragments = computed(() => {
  const data = props.inspectionData.groundedness.map((fragment) => ({
    ...fragment, // Required to create copies of the fragments and not update the prop
  }));

  if (data.length > 0) {
    const firstFragment = data[0];
    const lastFragment = data.at(-1);

    firstFragment.sentence = `“${firstFragment.sentence}`;
    lastFragment.sentence = `${lastFragment.sentence}”`;
  }

  return data;
});

function close() {
  emit('update:model-value', false);
}

function getReliabilityLevel(item) {
  const { score } = item;

  if (score === 0) return 'unreliable';
  if (score <= 33) return 'slightly-reliable';
  if (score <= 66) return 'moderately-reliable';
  if (score <= 100) return 'highly-reliable';
  return 'unreliable';
}
</script>

<style lang="scss" scoped>
.inspect-response {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;

  &__contact,
  &__agent {
    display: grid;
    gap: $unnnic-spacing-nano;

    .contact__text,
    .agent__text {
      color: $unnnic-color-neutral-darkest;
      font-size: $unnnic-font-size-body-lg;
    }
  }

  &__agent {
    .agent__text {
      display: inline;

      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    }

    .agent__text-success {
      display: grid;
      gap: $unnnic-spacing-sm;

      .text-success__sentences {
        .text-success__text {
          margin-right: $unnnic-spacing-nano;

          text-decoration: underline;
          text-decoration-color: $unnnic-color-neutral-cleanest;
          text-decoration-thickness: 3px;
          text-underline-offset: 4px;

          &--slightly-reliable {
            text-decoration-color: $unnnic-color-weni-300;
          }
          &--moderately-reliable {
            text-decoration-color: $unnnic-color-weni-600;
          }
          &--highly-reliable {
            text-decoration-color: $unnnic-color-weni-800;
          }
        }
      }

      .text-success__groundedness {
        display: grid;
        gap: $unnnic-spacing-xs;

        .groundedness__source {
          display: grid;
          grid-template-columns: auto auto 1fr;
          gap: $unnnic-spacing-xs;
          align-items: center;

          .source__status {
            width: 10px;
            height: 10px;
            border-radius: 10px;
            background-color: $unnnic-color-neutral-cleanest;

            &--slightly-reliable {
              background-color: $unnnic-color-weni-300;
            }
            &--moderately-reliable {
              background-color: $unnnic-color-weni-600;
            }
            &--highly-reliable {
              background-color: $unnnic-color-weni-800;
            }
          }

          .source__filename {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;

            &--not-found {
              color: $unnnic-color-neutral-dark;
              font-family: $unnnic-font-family-secondary;
              font-size: $unnnic-font-size-body-gt;
              line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
              font-style: italic;
            }
          }

          .source__confidence {
            white-space: nowrap;
          }
        }
      }
    }
  }

  &__action {
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    border-radius: $unnnic-border-radius-sm;

    padding: $unnnic-spacing-xs;

    display: flex;
    align-items: center;
    gap: $unnnic-spacing-xs;

    .action__name {
      color: $unnnic-color-neutral-dark;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    }
  }
}
</style>
