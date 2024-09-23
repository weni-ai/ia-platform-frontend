<template>
  <div
    :class="{
      'unnnic-side-bar-item': true,
      'unnnic-side-bar-item--active': active,
      'unnnic--clickable': true,
    }"
    @click="onClick"
  >
    <UnnnicToolTip
      :enabled="enableTooltip"
      :text="text"
      side="right"
    >
      <UnnnicIcon
        class="unnnic-side-bar-item__icon"
        :scheme="active ? 'brand-weni-soft' : 'neutral-cloudy'"
        size="sm"
        :icon="icon"
        :filled="iconFilled"
      />
      <span class="unnnic-side-bar-item__label">
        {{ text }}
        <slot />
      </span>
    </UnnnicToolTip>
  </div>
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
    enableTooltip: {
      type: Boolean,
      default: false,
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
.unnnic-side-bar-item {
  display: flex;
  align-items: center;
  color: $unnnic-color-neutral-darkest;
  margin-bottom: $unnnic-spacing-stack-xs;
  padding: $unnnic-inset-nano;
  font-size: $unnnic-font-size-body-gt;
  font-family: $unnnic-font-family-secondary;
  border-radius: $unnnic-border-radius-sm;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-medium;

  &--active {
    background-color: rgba(
      $unnnic-color-brand-weni,
      $unnnic-opacity-level-light
    );
    font-weight: $unnnic-font-weight-bold;
  }

  &__icon {
    margin-right: $unnnic-inline-xs;
    color: $unnnic-color-neutral-cloudy;

    &--active {
      color: $unnnic-color-brand-weni;
    }
  }
}
</style>
