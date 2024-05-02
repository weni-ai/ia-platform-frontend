<template>
  <UnnnicToolTip
    :text="helpText || ''"
    :enabled="!disabled && helpText && helpText.length > 0"
    side="bottom"
    maxWidth="15rem"
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
      <UnnnicCardNumber
        :description="label"
        :number="`${count}`"
      />
    </div>
  </UnnnicToolTip>
</template>

<script>
export default {
  name: 'NumbersCard',
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
@import '@/assets/scss/colors.scss';
@import '@/assets/scss/variables.scss';
@import '@weni/unnnic-system/dist/unnnic.css';
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.number-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: $color-fake-black;
  width: 160px;
  text-align: left;

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

:deep(.unnnic-card-number h4) {
  font-family: $unnnic-font-family-secondary;
}
</style>
