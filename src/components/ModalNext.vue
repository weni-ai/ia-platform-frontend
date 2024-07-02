<template>
  <div class="create-intelligence-modal__background">
    <div
      class="create-intelligence-modal__container"
      :style="{ maxWidth: maxWidth }"
    >
      <h1
        class="create-intelligence-modal__container__title"
        v-if="title"
      >
        {{ title }}
      </h1>

      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    maxWidth: {
      type: String,
      default: '600px',
    },
  },
};
</script>

<style lang="scss" scoped>
.create-intelligence-modal {
  &__background {
    z-index: 1;
    position: fixed;
    background-color: rgba(
      $unnnic-color-neutral-darkest,
      $unnnic-opacity-level-clarifying
    );

    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    overflow: auto;
  }

  &__container {
    flex: 1;
    border-radius: $unnnic-border-radius-sm;
    background-color: $unnnic-color-neutral-light;
    box-shadow: $unnnic-shadow-level-separated;
    box-sizing: border-box;

    padding-block: $unnnic-spacing-giant $unnnic-spacing-lg;
    padding-inline: $unnnic-spacing-md;

    margin: auto;

    &__title {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-black;
      font-size: $unnnic-font-size-title-sm;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;

      text-align: center;
      margin-block: 0 $unnnic-spacing-sm;
    }
  }
}
</style>
