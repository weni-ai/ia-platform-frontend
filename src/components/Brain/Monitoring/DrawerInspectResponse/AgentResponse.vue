<template>
  <section class="inspect-response__agent">
    <UnnnicIntelligenceText
      data-testid="agent-response-title"
      color="neutral-cloudy"
      family="secondary"
      size="body-gt"
      tag="p"
    >
      {{ $t('router.monitoring.inspect_response.agent_response') }}:
    </UnnnicIntelligenceText>
    <ResponseSuccessGroundedness
      v-if="showSuccessGroundedness"
      data-testid="agent-response-success-groundedness"
      :inspectionData="inspectionData"
    />
    <p
      v-else
      data-testid="agent-response-text"
      class="agent__text"
    >
      “{{ response }}”
    </p>
  </section>
</template>

<script setup>
import { computed } from 'vue';

import ResponseSuccessGroundedness from '../ResponseSuccessGroundedness/index.vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    default: '',
  },
  inspectionData: {
    type: Object,
    required: true,
  },
});

const showSuccessGroundedness = computed(
  () =>
    props.status === 'success' &&
    props.inspectionData.groundedness.find(
      (fragment) => fragment.sources.length,
    ),
);
</script>
