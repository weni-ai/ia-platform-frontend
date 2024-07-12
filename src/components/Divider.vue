<template>
  <hr
    :class="[
      'divider',
      `divider--y-spacing-${ySpacing}`,
      `divider--scheme-${scheme}`,
    ]"
  />
</template>

<script>
export default {
  name: 'UnnnicDivider',

  props: {
    ySpacing: {
      type: String,
      default: 'md',
    },

    scheme: {
      type: String,
      default: 'neutral-soft',
    },
  },
};
</script>

<style lang="scss" scoped>
.divider {
  border: none;
  width: 100%;
  height: $unnnic-border-width-thinner;
  margin-block: ($unnnic-spacing-stack-md - $unnnic-border-width-thinner)
    $unnnic-spacing-stack-md;

  &--scheme-neutral-soft {
    background-color: $unnnic-color-neutral-soft;
  }

  &--scheme-neutral-lightest {
    background-color: $unnnic-color-neutral-lightest;
  }

  &--y-spacing-lg {
    margin-block: ($unnnic-spacing-stack-lg - $unnnic-border-width-thinner)
      $unnnic-spacing-stack-lg;
  }

  &--y-spacing-sm {
    margin-block: ($unnnic-spacing-stack-sm - $unnnic-border-width-thinner)
      $unnnic-spacing-stack-sm;
  }

  &--y-spacing-xs {
    margin-block: ($unnnic-spacing-stack-xs - $unnnic-border-width-thinner)
      $unnnic-spacing-stack-xs;
  }
}
</style>
