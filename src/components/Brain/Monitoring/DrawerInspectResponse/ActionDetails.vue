<template>
  <section class="action-details">
    <UnnnicAvatarIcon
      class="action__icon"
      size="sm"
      icon="bolt"
      scheme="aux-blue"
    />
    <p class="action__name">{{ action.name }}</p>
  </section>
</template>

<script setup>
defineProps({
  action: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped lang="scss">
.action-details {
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-sm;

  padding: $unnnic-spacing-xs;

  display: flex;
  align-items: center;
  gap: $unnnic-spacing-xs;

  .action__name {
    color: $unnnic-color-neutral-dark;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>
