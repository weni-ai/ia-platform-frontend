<template>
  <section class="text-sentences">
    <template
      v-for="fragment in fragments"
      :key="fragment.sentence"
    >
      <p
        :class="[
          'text-sentences__text',
          `text-sentences__text--${getReliabilityLevel(fragment)}`,
        ]"
      >
        {{ fragment.sentence }}
      </p>
    </template>
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
