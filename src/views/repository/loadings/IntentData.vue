<!-- eslint-disable max-len -->
<template>
  <div class="intent-loading">
    <div class="intent-loading__data">
      <unnnic-skeleton-loading tag="div" width="1029px" height="320px" />
      <unnnic-skeleton-loading tag="div" width="1029px" height="429px" />
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.intent-loading {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  padding-bottom: $unnnic-spacing-stack-sm;

  &__data {
    margin-top: $unnnic-spacing-stack-md;
  }
}
</style>
