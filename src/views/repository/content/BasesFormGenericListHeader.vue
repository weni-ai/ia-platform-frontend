<template>
  <header
    :class="[
      `header header--shape-${shape}`,
      { 'header--hide-toggle': hideToggle },
    ]"
    @click="toggleAccordionOpen"
  >
    <UnnnicIntelligenceText
      color="neutral-dark"
      family="secondary"
      weight="bold"
      :size="shape === 'accordion' ? 'body-gt' : 'body-lg'"
      data-test="title"
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
      data-test="accordion-expand-button"
    />

    <UnnnicButton
      v-else-if="!hideToggle"
      size="small"
      type="primary"
      class="files-list__header__button"
      data-test="add-more-button"
      @click="$emit('add')"
    >
      {{ addText }}
    </UnnnicButton>
  </header>
</template>

<script>
export default {
  props: {
    open: Boolean,
    title: {
      type: String,
      required: false,
      default: '',
    },
    counter: {
      type: String,
      required: false,
      default: '',
    },
    addText: {
      type: String,
      required: false,
      default: '',
    },
    shape: {
      type: String,
      required: false,
      default: '',
    },
    hideToggle: Boolean,
  },
  emits: ['add', 'update:open'],

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
