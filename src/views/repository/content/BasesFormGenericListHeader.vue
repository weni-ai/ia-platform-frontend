<template>
  <header
    :class="`header header--shape-${shape}`"
    @click="toggleAccordionOpen"
  >
    <UnnnicIntelligenceText
      color="neutral-darkest"
      family="secondary"
      weight="bold"
      :size="shape === 'accordion' ? 'body-gt' : 'body-lg'"
    >
      {{ title }}
      <template v-if="counter">({{ counter }})</template>
    </UnnnicIntelligenceText>

    <UnnnicIcon
      v-if="shape === 'accordion'"
      scheme="neutral-dark"
      :icon="open ? 'expand_less' : 'expand_more'"
      size="ant"
      clickable
    />

    <UnnnicButton
      v-else
      @click="$emit('add')"
      size="small"
      type="primary"
      class="files-list__header__button"
    >
      {{ addText }}
    </UnnnicButton>
  </header>
</template>

<script>
export default {
  props: {
    open: Boolean,
    title: String,
    counter: String,
    addText: String,
    shape: String,
  },

  methods: {
    toggleAccordionOpen() {
      if (this.shape !== 'accordion') {
        return;
      }

      this.$emit('update:open', !this.open);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: $unnnic-spacing-nano;

  &--shape-accordion {
    user-select: none;
    display: inline-flex;
    cursor: pointer;
  }

  &__button {
    width: 12.5 * $unnnic-font-size;
  }
}
</style>
