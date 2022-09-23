<!-- eslint-disable max-len -->
<template>
  <div class="intent-loading">
    <div class="intent-loading__header">
      <div>
        <unnnic-skeleton-loading tag="div" width="307px" height="25px" />
        <unnnic-skeleton-loading tag="div" width="256px" height="25px" />
      </div>
      <div class="intent-loading__buttons">
        <unnnic-skeleton-loading tag="div" width="249px" height="54px" />
        <unnnic-skeleton-loading tag="div" width="249px" height="54px" />
      </div>
    </div>

    <unnnic-skeleton-loading tag="hr" width="100px" height="1px" />

    <div class="intent-loading__fields">
      <div>
        <unnnic-skeleton-loading tag="div" width="515px" height="29px" />
      </div>
      <div class="intent-loading__fields__selects">
        <unnnic-skeleton-loading tag="div" width="300px" height="29px" />
      </div>
    </div>

    <div class="intent-loading__table">
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
    </div>

    <unnnic-skeleton-loading tag="hr" width="100px" height="1px" />

    <div class="intent-loading__pagination">
      <unnnic-skeleton-loading tag="div" width="126px" height="36px" />
      <unnnic-skeleton-loading tag="div" width="300px" height="36px" />
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

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__description {
    display: flex;
    justify-content: space-between;
  }

  &__buttons {
    display: flex;
    gap: $unnnic-spacing-inline-sm;
  }


  &__fields {
    display: flex;
    justify-content: space-between;

    &__selects {
      display: flex;
      gap: $unnnic-spacing-inline-sm;
    }
  }

  &__table {
    margin-top: $unnnic-spacing-stack-sm;
  }

  &__pagination {
    display: flex;
    justify-content: space-between;
  }
}
</style>
