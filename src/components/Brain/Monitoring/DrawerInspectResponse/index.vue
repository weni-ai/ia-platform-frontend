<template>
  <UnnnicDrawer
    data-testid="drawer"
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
        <ContactMessage :text="inspectionData.text" />
        <ActionDetails
          v-if="llmStatus === 'action'"
          :action="inspectionData.action"
        />
        <AgentResponse
          v-if="llmStatus !== 'action'"
          :status="llmStatus"
          :response="inspectionData.llm.response"
          :inspectionData="inspectionData"
        />
        <ResponseEvaluator
          v-if="llmStatus !== 'failed'"
          :isApproved="inspectionData.is_approved"
        />
      </section>
    </template>
  </UnnnicDrawer>
</template>

<script setup>
import { computed } from 'vue';

import ContactMessage from './ContactMessage.vue';
import ActionDetails from './ActionDetails.vue';
import AgentResponse from './AgentResponse.vue';
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

const llmStatus = computed(() => props.inspectionData.llm.status);

function close() {
  emit('update:model-value', false);
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

  &__agent .agent__text {
    display: inline;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  }
}
</style>
