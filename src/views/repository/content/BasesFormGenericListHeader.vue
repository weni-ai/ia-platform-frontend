<template>
  <header
    :class="[
      `header header--shape-${shape}`,
      { 'header--hide-toggle': hideToggle },
    ]"
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
      v-if="shape === 'accordion' && !hideToggle"
      scheme="neutral-dark"
      :icon="open ? 'expand_less' : 'expand_more'"
      size="ant"
      clickable
    />

    <UnnnicButton
      v-else-if="!hideToggle"
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
    hideToggle: Boolean,
  },

  methods: {
    toggleAccordionOpen() {
      if (this.shape !== 'accordion' || this.hideToggle) {
        return;
      }

      this.$emit('update:open', !this.open);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

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

  &--hide-toggle {
    user-select: initial;
    cursor: initial;
  }

  &__button {
    width: 12.5 * $unnnic-font-size;
  }
}
</style>
