<template>
  <section
    class="skeleton-loading"
    :style="{ marginTop }"
  >
    <UnnnicSkeletonLoading
      v-if="label"
      class="skeleton-loading__label"
      tag="div"
      width="90px"
      height="22px"
    />

    <UnnnicSkeletonLoading
      tag="div"
      :width="elementWidth"
      :height="elementHeight"
    />
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: Boolean,
  element: {
    type: String,
    default: 'input',
  },
  elementHeight: String,
  elementWidth: {
    type: String,
    default: '100%',
  },
  marginTop: String,
});

const defaultElementHeights = {
  input: '46px',
  textarea: '104px',
};

const elementHeight = computed(
  () => props.elementHeight || defaultElementHeights[props.element],
);
</script>

<style lang="scss" scoped>
.skeleton-loading {
  display: block;
  width: 100%;

  :deep(*) {
    display: block;
  }

  &__label {
    margin-bottom: $unnnic-spacing-xs;
  }
}
</style>
