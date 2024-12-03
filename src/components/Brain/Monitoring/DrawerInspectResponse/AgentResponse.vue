<template>
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
      v-if="status !== 'success'"
      class="agent__text"
    >
      “{{ response }}”
    </p>
    <ResponseSuccessGroundedness
      v-if="status === 'success'"
      :inspectionData="inspectionData"
    />
  </section>
</template>

<script setup>
import ResponseSuccessGroundedness from '../ResponseSuccessGroundedness/index.vue';

defineProps({
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
</script>
