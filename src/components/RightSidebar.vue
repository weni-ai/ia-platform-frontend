<template>
  <aside
    class="side-bar__container"
    @click.self="$emit('close')"
  >
    <section class="side-bar__content">
      <section class="side-bar__content__scrollable">
        <header class="side-bar__header">
          <section class="side-bar__header__title">
            {{ title }}

            <UnnnicButton
              class="side-bar__header__title__close-button"
              size="small"
              type="tertiary"
              iconCenter="close"
              scheme="neutral-dark"
              @click="$emit('close')"
            />
          </section>

          <div class="side-bar__header__description">
            {{ description }}
          </div>
        </header>

        <UnnnicDivider
          v-if="dividerYSpacing"
          :ySpacing="dividerYSpacing"
        />

        <slot></slot>
      </section>
    </section>
  </aside>
</template>

<script>
export default {
  props: {
    title: String,
    description: String,
    dividerYSpacing: String,
  },
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.side-bar {
  &__header {
    &__title {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-title-sm;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-bold;

      display: flex;
      align-items: center;
      gap: $unnnic-spacing-sm;
      justify-content: space-between;
      margin-bottom: $unnnic-spacing-sm;

      &__close-button {
        align-self: self-start;
      }
    }

    &__description {
      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-regular;
    }
  }

  &__container {
    z-index: 1;
    background: rgba(#262626, $unnnic-opacity-level-overlay);
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: flex-end;
  }

  &__content {
    flex: 1;
    max-width: 29 * $unnnic-font-size;
    background-color: $unnnic-color-background-snow;
    padding: $unnnic-spacing-md $unnnic-spacing-lg;
    box-sizing: border-box;
    display: flex;

    &__scrollable {
      flex: 1;
      overflow: overlay;
      display: flex;
      flex-direction: column;

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
}
</style>
