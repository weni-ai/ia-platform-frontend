<template>
  <section
    v-for="fragment in fragments"
    :key="fragment.sentence"
    class="groundedness-sources"
  >
    <section class="groundedness-sources__source">
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
          $t('router.monitoring.inspect_response.confidence_percentage', {
            percentage: fragment.score,
          })
        }}
      </UnnnicIntelligenceText>
    </section>
  </section>
</template>

<script setup>
defineProps({
  fragments: {
    type: Array,
    required: true,
  },
  getReliabilityLevel: {
    type: Function,
    required: true,
  },
});
</script>

<style scoped lang="scss">
.groundedness-sources {
  display: grid;
  gap: $unnnic-spacing-xs;

  .groundedness-sources__source {
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
</style>
