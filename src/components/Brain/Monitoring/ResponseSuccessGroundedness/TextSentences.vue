<template>
  <section
    data-testid="sentences"
    class="text-sentences"
    @mouseleave="clearHoveredSentence"
  >
    <UnnnicToolTip
      v-for="(fragment, index) in fragments"
      :key="fragment.sentence"
      data-testid="sentence-text"
      :text="getTooltipText(fragment)"
      :class="getTextClasses(index, fragment)"
      side="top"
      enabled
      :forceOpen="hoveredSentence === index"
      @mouseover="setHoveredSentence(index)"
    >
      {{ fragment.sentence }}
    </UnnnicToolTip>
  </section>
</template>

<script setup>
import { ref } from 'vue';

import i18n from '@/utils/plugins/i18n';

const props = defineProps({
  fragments: {
    type: Array,
    required: true,
  },
  getReliabilityLevel: {
    type: Function,
    required: true,
  },
});

const hoveredSentence = ref(null);

function setHoveredSentence(index) {
  hoveredSentence.value = index;
}

function clearHoveredSentence() {
  hoveredSentence.value = null;
}

function truncateString(string, maxLength = 25) {
  if (!string) return;

  return string.length > maxLength
    ? `${string.slice(0, maxLength)}...`
    : string;
}

function getTooltipText(fragment) {
  const truncatedFileName = truncateString(fragment.sources?.[0].filename);
  const confidence = i18n.global.t(
    'router.monitoring.inspect_response.confidence_percentage',
    {
      percentage: fragment.score,
    },
  );
  return `${truncatedFileName}\n(${confidence})`;
}

function getTextClasses(index, fragment) {
  return [
    'text-sentences__text',
    `text-sentences__text--${props.getReliabilityLevel(fragment)}`,
    { 'text-sentences__text--focused': hoveredSentence.value === index },
  ];
}
</script>

<style scoped lang="scss">
.text-sentences {
  .text-sentences__text {
    margin-right: $unnnic-spacing-nano;

    display: inline;

    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-body-lg;
    text-decoration: underline;
    text-decoration-color: $unnnic-color-neutral-cleanest;
    text-decoration-thickness: 3px;
    text-underline-offset: 4px;

    cursor: default;

    &--focused {
      text-decoration-thickness: 5px;
    }

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
</style>
