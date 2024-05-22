<template>
  <section class="quick-test-warn">
    <UnnnicIcon
      :icon="icon"
      scheme="inherit"
      size="sm"
    />

    <UnnnicIntelligenceText
      family="secondary"
      size="body-gt"
      color="inherit"
    >
      {{ text }}
    </UnnnicIntelligenceText>
  </section>
</template>

<script>
export default {
  props: {
    icon: String,
    text: String,
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.quick-test-warn {
  display: flex;
  align-items: center;
  column-gap: $unnnic-spacing-xs;
  background-color: $unnnic-color-aux-yellow-100;
  color: $unnnic-color-aux-yellow-700;
  padding: $unnnic-spacing-ant;
  border-radius: $unnnic-border-radius-sm;
}
</style>
