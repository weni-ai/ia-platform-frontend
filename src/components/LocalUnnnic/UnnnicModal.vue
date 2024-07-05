<template>
  <section class="unnnic-modal__background">
    <section v-bind="modalDynamicAttributes">
      <header
        v-if="hasHeader"
        class="unnnic-modal__header"
      >
        <UnnnicIcon
          v-if="headerIcon"
          class="unnnic-modal__header__header-icon"
          :icon="headerIconOrDefault"
          size="md"
        />

        <h1 v-if="title">{{ title }}</h1>

        <UnnnicIcon
          class="unnnic-modal__header__button-close"
          icon="close"
          size="md"
          clickable
          @click="$emit('close')"
        />
      </header>

      <section
        :class="[
          'unnnic-modal__content',
          { 'unnnic-modal__content--text-center': hasBodyImage },
        ]"
      >
        <section class="unnnic-modal__content__scrollable">
          <section
            v-if="hasBodyImage"
            class="unnnic-modal__content__body-image"
          >
            <img :src="bodyImageSrc" />

            <h1 v-if="title">{{ title }}</h1>
          </section>

          <slot />
        </section>
      </section>

      <footer
        v-if="hasFooter"
        class="unnnic-modal__footer"
      >
        <slot
          name="footer"
          v-bind="footerScopedAttributes"
        />
      </footer>
    </section>
  </section>
</template>

<script>
export default {
  props: {
    title: String,

    type: {
      type: String,
      default: 'default',
      validator(value) {
        return [
          'default',
          'alert',
          'alert-action',
          'content',
          'custom',
        ].includes(value);
      },
    },

    size: {
      type: [String, Number],
      default: 'md',
      validator(value) {
        return ['sm', 'md', 'lg'].includes(value) || typeof value === 'number';
      },
    },

    headerIcon: [Boolean, String],

    appearance: {
      type: String,
      default: 'success',
      validator(value) {
        return ['success', 'warning', 'attention'].includes(value);
      },
    },

    bodyImageSrc: String,
  },

  computed: {
    hasBodyImage() {
      return !!this.bodyImageSrc;
    },

    hasHeader() {
      return !this.hasBodyImage && this.title;
    },

    hasFooter() {
      return !!this.$slots.footer;
    },

    modalDynamicAttributes() {
      const attributes = {
        class: [
          'unnnic-modal',
          `unnnic-modal--appearance-${this.appearance}`,
          `unnnic-modal--type-${this.type}`,
        ],
      };

      if (typeof this.size === 'string') {
        attributes.class.push(`unnnic-modal--size-${this.size}`);
      } else {
        attributes.style = { maxWidth: `${this.size}px` };
      }

      return attributes;
    },

    headerIconOrDefault() {
      if (typeof this.headerIcon === 'string') {
        return this.headerIcon;
      }

      return {
        success: 'check_circle',
        warning: 'warning',
        attention: 'error',
      }[this.appearance];
    },

    footerScopedAttributes() {
      return {
        buttonPrimaryType: {
          success: 'primary',
          warning: 'warning',
          attention: 'attention',
        }[this.appearance],
        buttonSecondaryType: 'tertiary',
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.unnnic-modal {
  &__background {
    z-index: 1;

    background-color: transparentize($unnnic-color-neutral-darkest, 0.5);

    width: 100vw;
    height: 100vh;
    box-sizing: border-box;
    padding: $unnnic-spacing-sm;

    position: fixed;

    top: 0;
    left: 0;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  $modal-border-radius: $unnnic-border-radius-md;
  $modal-background-color: $unnnic-color-neutral-white;

  display: flex;
  flex-direction: column;
  max-height: 90vh;

  border-radius: $modal-border-radius;
  box-shadow: $unnnic-shadow-level-near;

  width: 100%;

  &--size-sm {
    max-width: 25 * $unnnic-font-size;
  }

  &--size-md {
    max-width: 37.5 * $unnnic-font-size;
  }

  &--size-lg {
    max-width: 50 * $unnnic-font-size;
  }

  > :first-child {
    border-top-left-radius: $modal-border-radius;
    border-top-right-radius: $modal-border-radius;
  }

  > :last-child {
    border-bottom-left-radius: $modal-border-radius;
    border-bottom-right-radius: $modal-border-radius;
  }

  &--appearance-success {
    .unnnic-modal__header__header-icon {
      color: $unnnic-color-aux-green-500;
    }
  }

  &--appearance-warning {
    .unnnic-modal__header__header-icon {
      color: $unnnic-color-aux-red-500;
    }
  }

  &--appearance-attention {
    .unnnic-modal__header__header-icon {
      color: $unnnic-color-aux-yellow-500;
    }
  }

  &--type-alert-action {
    .unnnic-modal__footer {
      border: none;
      padding-top: $unnnic-spacing-xs;
    }
  }

  &__header h1,
  &__content__body-image h1 {
    margin: 0;

    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-title-sm;
    line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-black;
  }

  &__header {
    background-color: $modal-background-color;
    padding: $unnnic-spacing-md;
    padding-bottom: $unnnic-spacing-md - $unnnic-border-width-thinner;
    border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

    display: flex;
    column-gap: $unnnic-spacing-ant;
    align-items: center;

    & &__button-close {
      cursor: pointer;
      user-select: none;
      margin-left: auto;
      color: $unnnic-color-neutral-cloudy;
    }
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: $modal-background-color;
    padding: $unnnic-spacing-md;
    overflow: auto;

    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-regular;

    &--text-center {
      text-align: center;
    }

    &__body-image {
      img {
        display: block;
        margin: 0 auto;
        margin-bottom: $unnnic-spacing-sm;
      }

      h1 {
        text-align: center;
      }

      &:not(:last-child) {
        margin-bottom: $unnnic-spacing-xs;
      }
    }

    &__scrollable {
      overflow: overlay;

      $scroll-size: $unnnic-inline-nano;

      padding-right: $unnnic-inline-xs + $scroll-size;
      margin-right: -($unnnic-inline-xs + $scroll-size);

      &::-webkit-scrollbar {
        width: $scroll-size;
      }

      &::-webkit-scrollbar-thumb {
        background: $unnnic-color-neutral-clean;
        border-radius: $unnnic-border-radius-pill;
      }

      &::-webkit-scrollbar-track {
        background: $unnnic-color-neutral-soft;
        border-radius: $unnnic-border-radius-pill;
      }
    }
  }

  &__footer {
    background-color: $modal-background-color;

    display: flex;
    column-gap: $unnnic-spacing-sm;
    padding: $unnnic-spacing-md;
    padding-top: $unnnic-spacing-md - $unnnic-border-width-thinner;
    border-top: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

    > * {
      flex: 1;
    }
  }
}
</style>
