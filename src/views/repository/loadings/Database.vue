<!-- eslint-disable max-len -->
<template>
  <div class="database-loading">
    <div class="database-loading__header">
      <unnnic-skeleton-loading class="database-loading__title" tag="div" width="40px" height="40px" />
      <unnnic-skeleton-loading tag="div" width="189px" height="40px" />
      <unnnic-skeleton-loading class="database-loading__button" tag="div" width="261px" height="50px" />
    </div>
    <div class="database-loading__description">
      <div>
        <unnnic-skeleton-loading tag="div" width="507px" height="17px" />
      </div>
    </div>

    <unnnic-skeleton-loading tag="hr" width="100px" height="1px" />

    <div class="database-loading__fields">
      <div>
        <unnnic-skeleton-loading tag="div" width="384px" height="29px" />
      </div>
      <div class="database-loading__fields__selects">
        <unnnic-skeleton-loading tag="div" width="227px" height="29px" />
        <unnnic-skeleton-loading tag="div" width="227px" height="29px" />
      </div>
    </div>

    <div class="database-loading__table">
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
    </div>

  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.database-loading {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  padding-bottom: $unnnic-spacing-stack-sm;

  &__title {
    margin: $unnnic-spacing-inline-xs 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-inline-sm;
    height: 80px;
  }

  &__description {
    display: flex;
    justify-content: space-between;
  }

  &__button {
    margin-left: auto;
    align-self: end;
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
}
</style>
