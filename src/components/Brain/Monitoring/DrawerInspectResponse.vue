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
        <section class="inspect-response__agent">
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
          <section v-else>
            <template
              v-for="fragment of groundednessFragments"
              :key="fragment.sentence"
            >
              <p
                :class="[
                  'agent__text',
                  'agent__text--underlined',
                  `agent__text--underlined-${getReliabilityLevel(fragment)}`,
                ]"
              >
                {{ fragment.sentence }}
              </p>
            </template>
          </section>
        </section>
      </section>
    </template>
  </UnnnicDrawer>
</template>

<script setup>
import { computed } from 'vue';

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

      &--underlined {
        margin-right: $unnnic-spacing-nano;

        text-decoration: underline;
        text-decoration-color: $unnnic-color-neutral-cleanest;
        text-decoration-thickness: 3px;
        text-underline-offset: 4px;

        &-slightly-reliable {
          text-decoration-color: $unnnic-color-weni-300;
        }
        &-moderately-reliable {
          text-decoration-color: $unnnic-color-weni-600;
        }
        &-highly-reliable {
          text-decoration-color: $unnnic-color-weni-800;
        }
      }
    }
  }
}
</style>
