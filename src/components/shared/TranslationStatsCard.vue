<template>
  <BTooltip
    :active="!disabled && helpText && helpText.length > 0"
    :label="helpText"
    multilined
    type="is-dark"
    position="is-bottom"
  >
    <div
      :class="{
        'number-card': true,
        'number-card--active': !disabled && active,
        'number-card--hoverable':
          !disabled && (clickable || (helpText && helpText.length > 0)),
        'number-card--disabled': disabled,
        'number-card--clickable': clickable && !disabled,
        'number-card--clickable--inverted': !disabled && active && clickable,
      }"
      @click="onClick"
    >
      <h1 :class="['has-text-centered', `number-card__title--size-${size}`]">
        {{ count }}
      </h1>
      <p :class="['has-text-centered', `number-card__subtitle--size-${size}`]">
        {{ label }}
      </p>
    </div>
  </BTooltip>
</template>

<script>
export default {
  name: 'TranslationStatsCard',
  props: {
    clickable: {
      type: Boolean,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: null,
    },
    active: {
      type: Boolean,
      default: false,
    },
    count: {
      type: Number,
      default: 0,
    },
    label: {
      type: String,
      default: null,
    },
    helpText: {
      type: String,
      default: null,
    },
    size: {
      type: String,
      default: 'normal',
    },
  },
  methods: {
    onClick() {
      if (this.clickable) this.$emit('click');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

.number-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: $color-fake-black;

  &--clickable {
    &:hover {
      color: $color-primary;
    }
    &--inverted:hover {
      color: black;
    }
  }

  &--active {
    color: $color-primary;
  }

  &--hoverable {
    &:hover {
      cursor: pointer;
    }
  }

  &--disabled {
    opacity: 0.3;
  }

  &__title {
    &--size-normal {
      font-size: 2.938rem;
    }

    &--size-medium {
      font-size: 2.188rem;
    }
  }

  &__subtitle {
    &--size-normal {
      margin: 0.5rem 0;
    }

    &--size-medium {
      margin: 0.25rem 0;
    }
  }
}

h2 {
  color: $color-fake-black;
  font-weight: $font-weight-bolder;
  font-family: $font-family;
}

h1 {
  font-weight: $font-weight-bolder;
  font-family: $font-family;
  margin: 0;
}
</style>
