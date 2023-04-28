<template>
  <div>
    <div class="title-container">
      <unnnic-skeleton-loading tag="div" width="2.5rem" height="2.5rem" />
      <unnnic-skeleton-loading tag="div" width="14rem" height="2.5rem" />
    </div>

    <div class="description-container">
      <unnnic-skeleton-loading tag="div" width="31rem" height="2.75rem" />
    </div>

    <div class="divider"></div>

    <unnnic-skeleton-loading tag="div" width="90%" height="1.375rem" />

    <div class="sentences">
      <unnnic-skeleton-loading tag="div" height="9.25rem" />
      <unnnic-skeleton-loading tag="div" height="9.25rem" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.title-container {
  display: flex;
  column-gap: $unnnic-spacing-inline-lg;
}

.description-container {
  margin-top: $unnnic-spacing-stack-sm;
}

.divider {
  margin: $unnnic-spacing-stack-lg 0;
  width: 100%;
  height: $unnnic-border-width-thinner;
  background-color: $unnnic-color-neutral-soft;
}

.sentences {
  margin-top: $unnnic-spacing-inline-sm + $unnnic-spacing-inline-nano;
  display: flex;
  column-gap: $unnnic-spacing-inline-sm;

  > * {
    flex: 1;
  }
}
</style>
