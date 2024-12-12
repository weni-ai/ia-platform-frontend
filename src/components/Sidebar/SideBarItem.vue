<template>
  <section
    :class="{
      'side-bar-item': true,
      'side-bar-item--active': active,
      'unnnic--clickable': true,
    }"
    @click="onClick"
  >
    <UnnnicIcon
      class="side-bar-item__icon"
      :scheme="active ? 'brand-weni-soft' : 'neutral-cloudy'"
      size="sm"
      :icon="icon"
      :filled="iconFilled"
      data-test="sidebar-item-icon"
    />
    <p class="side-bar-item__label">
      {{ text }}
    </p>

    <p
      v-if="tag"
      class="side-bar-item__tag"
      data-test="sidebar-item-tag"
    >
      {{ tag }}
    </p>
  </section>
</template>

<script>
export default {
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    expanded: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: null,
    },
    iconFilled: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: null,
    },
    tag: {
      type: String,
      default: '',
    },
  },
  emits: ['click'],
  methods: {
    onClick() {
      this.$emit('click');
    },
  },
};
</script>

<style lang="scss">
.side-bar-item {
  margin-bottom: $unnnic-spacing-stack-xs;

  border-radius: $unnnic-border-radius-sm;

  padding: $unnnic-inset-nano;

  display: flex;
  gap: $unnnic-spacing-xs;
  align-items: center;

  color: $unnnic-color-neutral-cloudy;
  font-size: $unnnic-font-size-body-gt;
  font-family: $unnnic-font-family-secondary;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-medium;

  &--active {
    background-color: $unnnic-color-background-sky;
    font-weight: $unnnic-font-weight-bold;
  }

  &__icon {
    color: $unnnic-color-neutral-cloudy;

    &--active {
      color: $unnnic-color-brand-weni;
    }
  }

  &__tag {
    color: $unnnic-color-weni-600;
    font-size: $unnnic-font-size-body-md;
    font-style: italic;
    font-weight: $unnnic-font-weight-bold;
  }
}
</style>
