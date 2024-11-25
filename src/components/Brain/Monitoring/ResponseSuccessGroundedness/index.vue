<template>
  <section
    class="response-success-groundedness"
    data-testid="response-success-groundedness"
  >
    <TextSentences
      :fragments="groundednessFragments"
      :getReliabilityLevel="getReliabilityLevel"
    />
    <GroundednessSources
      :fragments="groundednessFragments"
      :getReliabilityLevel="getReliabilityLevel"
    />
  </section>
</template>

<script setup>
import { computed } from 'vue';

import TextSentences from './TextSentences.vue';
import GroundednessSources from './GroundednessSources.vue';

const props = defineProps({
  inspectionData: {
    type: Object,
    required: true,
  },
});

const groundednessFragments = computed(() => {
  const data = props.inspectionData.groundedness.map((fragment) => ({
    ...fragment,
  }));

  if (data.length > 0) {
    const firstFragment = data[0];
    const lastFragment = data.at(-1);

    firstFragment.sentence = `“${firstFragment.sentence}`;
    lastFragment.sentence = `${lastFragment.sentence}”`;
  }

  return data;
});

function getReliabilityLevel(item) {
  const { score } = item;

  if (score === 0) return 'unreliable';
  if (score <= 33) return 'slightly-reliable';
  if (score <= 66) return 'moderately-reliable';
  if (score <= 100) return 'highly-reliable';
  return 'unreliable';
}
</script>

<style scoped lang="scss">
.response-success-groundedness {
  display: grid;
  gap: $unnnic-spacing-sm;
}
</style>
