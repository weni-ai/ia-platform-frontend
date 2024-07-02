<template>
  <Component
    :is="tagComputed"
    :class="[
      'unnnic-text',
      `unnnic-text--size-${size}`,
      `unnnic-text--line-height-${lineHeight}`,
      `unnnic-text--family-${family}`,
      `unnnic-text--weight-${weight}`,
      `unnnic-text--color-${color}`,
      marginTop ? `unnnic-text--margin-top-${marginTop}` : null,
      marginBottom ? `unnnic-text--margin-bottom-${marginBottom}` : null,
    ]"
    v-bind="$attrs"
  >
    <slot></slot>
  </Component>
</template>

<script>
export default {
  props: {
    tag: {
      type: String,
    },

    size: {
      type: String,
      required: true,
    },

    family: {
      type: String,
      default: 'primary',
    },

    lineHeight: {
      type: String,
      default: 'md',
    },

    weight: {
      type: String,
      default: 'regular',
    },

    color: {
      type: String,
      default: 'neutral-cloudy',
    },

    marginTop: {
      type: String,
    },

    marginBottom: {
      type: String,
    },
  },

  computed: {
    tagComputed() {
      const defaults = {
        h1: 'h1',
        h2: 'h2',
        h3: 'h3',
        h4: 'h4',
        'title-lg': 'h4',
        'title-md': 'h5',
        'title-sm': 'h6',
        'body-lg': 'span',
        'body-gt': 'span',
        'body-md': 'span',
        'body-sm': 'span',
      };

      return this.tag || defaults[this.size] || 'span';
    },
  },
};
</script>

<style lang="scss" scoped>
h1,
h2,
h3,
h4,
h5,
h6,
p {
  margin: 0;
}

.unnnic-text--family-primary {
  font-family: $unnnic-font-family-primary;
}

.unnnic-text--family-secondary {
  font-family: $unnnic-font-family-secondary;
}

$font-weights: (
  'light': $unnnic-font-weight-light,
  'regular': $unnnic-font-weight-regular,
  'bold': $unnnic-font-weight-bold,
  'black': $unnnic-font-weight-black,
);

@each $name, $weight in $font-weights {
  .unnnic-text--weight-#{$name} {
    font-weight: $weight;
  }
}

.unnnic-text :deep(strong) {
  font-weight: $unnnic-font-weight-bold;
}

$font-sizes: (
  'h1': $unnnic-font-size-h1,
  'h2': $unnnic-font-size-h2,
  'h3': $unnnic-font-size-h3,
  'h4': $unnnic-font-size-h4,
  'title-lg': $unnnic-font-size-title-lg,
  'title-md': $unnnic-font-size-title-md,
  'title-sm': $unnnic-font-size-title-sm,
  'body-lg': $unnnic-font-size-body-lg,
  'body-gt': $unnnic-font-size-body-gt,
  'body-md': $unnnic-font-size-body-md,
  'body-sm': $unnnic-font-size-body-sm,
);

@each $name, $size in $font-sizes {
  .unnnic-text--size-#{$name} {
    font-size: $size;

    &.unnnic-text--line-height-sm {
      line-height: $size + $unnnic-line-height-small;
    }

    &.unnnic-text--line-height-md {
      line-height: $size + $unnnic-line-height-md;
    }

    &.unnnic-text--line-height-lg {
      line-height: $size + $unnnic-line-height-large;
    }
  }
}

@each $name, $color in $scheme-colors {
  .unnnic-text--color-#{$name} {
    color: $color;
  }
}

$spacings: (
  'nano': $unnnic-spacing-nano,
  'xs': $unnnic-spacing-xs,
  'ant': $unnnic-spacing-ant,
  'sm': $unnnic-spacing-sm,
  'md': $unnnic-spacing-md,
  'lg': $unnnic-spacing-lg,
  'xl': $unnnic-spacing-xl,
  'giant': $unnnic-spacing-giant,
  'xgiant': $unnnic-spacing-xgiant,
  'awesome': $unnnic-spacing-awesome,
);

@each $name, $spacing in $spacings {
  .unnnic-text--margin-top-#{$name} {
    margin-top: $spacing;
  }

  .unnnic-text--margin-bottom-#{$name} {
    margin-bottom: $spacing;
  }
}
</style>
