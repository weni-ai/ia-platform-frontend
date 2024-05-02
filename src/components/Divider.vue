<template>
  <hr :class="['divider', `divider--y-spacing-${ySpacing}`]" />
</template>

<script>
export default {
  name: 'UnnnicDivider',

  props: {
    ySpacing: {
      type: String,
      default: 'md',
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.divider {
  border: none;
  height: $unnnic-border-width-thinner;
  background-color: $unnnic-color-neutral-soft;
  margin-block: ($unnnic-spacing-stack-md - $unnnic-border-width-thinner)
    $unnnic-spacing-stack-md;

  &--y-spacing-lg {
    margin-block: ($unnnic-spacing-stack-lg - $unnnic-border-width-thinner)
      $unnnic-spacing-stack-lg;
  }

  &--y-spacing-sm {
    margin-block: ($unnnic-spacing-stack-sm - $unnnic-border-width-thinner)
      $unnnic-spacing-stack-sm;
  }
}
</style>
