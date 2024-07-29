<template>
  <section class="left-sidebar">
    <UnnnicIntelligenceText
      tag="p"
      color="neutral-white"
      family="secondary"
      size="title-sm"
      marginBottom="sm"
      weight="black"
    >
      {{ $t('modals.actions.add.title') }}
    </UnnnicIntelligenceText>

    <UnnnicIntelligenceText
      tag="p"
      color="neutral-white"
      family="secondary"
      size="body-gt"
      marginBottom="sm"
    >
      {{ $t('modals.actions.add.description') }}
    </UnnnicIntelligenceText>

    <footer class="left-sidebar__footer">
      <section
        v-for="(step, index) in steps"
        :key="index"
        :class="['step', { 'step--active': step.active }]"
      >
        {{ index + 1 }}. {{ step.title }}
      </section>
    </footer>
  </section>
</template>

<script setup>
defineProps({
  steps: {
    type: Array,
    default() {
      return [];
    },
  },
});
</script>

<style lang="scss" scoped>
$sidebar-width: $unnnic-font-size * 15.625;

.left-sidebar {
  width: $sidebar-width;
  height: 100%;
  padding: $unnnic-spacing-md;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;

  &__footer {
    margin-top: auto;
  }
}

.step {
  padding: $unnnic-spacing-xs;

  color: $unnnic-color-neutral-clean;
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-lg;
  line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  font-weight: $unnnic-font-weight-regular;

  + .step {
    margin-top: $unnnic-spacing-xs;
  }

  &--active {
    color: $unnnic-color-weni-600;
    font-weight: $unnnic-font-weight-bold;

    padding: $unnnic-spacing-xs - $unnnic-border-width-thinner;
    border: $unnnic-border-width-thinner solid $unnnic-color-weni-600;
    border-radius: $unnnic-border-radius-sm;
  }
}
</style>
