<!-- eslint-disable max-len -->
<template>
  <div class="translate-loading">
    <div class="translate-loading__header">
      <unnnic-skeleton-loading tag="div" width="189px" height="40px" />
    </div>
    <div class="translate-loading__description">
      <div>
        <unnnic-skeleton-loading tag="div" width="507px" height="17px" />
      </div>
    </div>

    <div class="translate-loading__fields__tabs">
      <unnnic-skeleton-loading tag="div" width="150px" height="20px" />
      <unnnic-skeleton-loading tag="div" width="150px" height="20px" />
    </div>

    <unnnic-skeleton-loading tag="hr" width="100px" height="1px" />

    <div class="translate-loading__counter">
      <unnnic-skeleton-loading tag="div" width="100%" height="100px" />
    </div>

    <div class="translate-loading__fields">
      <div>
        <unnnic-skeleton-loading tag="div" width="384px" height="45px" />
      </div>
      <div class="translate-loading__fields__selects">
        <unnnic-skeleton-loading tag="div" width="227px" height="45px" />
        <unnnic-skeleton-loading tag="div" width="227px" height="45px" />
      </div>
    </div>

    <div class="translate-loading__table">
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
      <unnnic-skeleton-loading tag="div" width="100%" height="60px" />
    </div>

    <unnnic-skeleton-loading tag="hr" width="100px" height="1px" />

    <div class="translate-loading__fields">
      <div>
        <unnnic-skeleton-loading tag="div" width="126px" height="36px" />
      </div>
      <div class="translate-loading__fields__selects">
        <unnnic-skeleton-loading tag="div" width="300px" height="36px" />
      </div>
    </div>

    <unnnic-skeleton-loading tag="hr" width="100px" height="1px" />

  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.translate-loading {
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
    // margin-top: $unnnic-spacing-stack-lg;
    display: flex;
    justify-content: space-between;

    &__selects {
      display: flex;
      gap: $unnnic-spacing-inline-sm;
    }

    &__tabs {
      margin-top: $unnnic-spacing-stack-lg;
      display: flex;
      gap: $unnnic-spacing-inline-sm;
    }
  }

  &__table {
    margin-top: $unnnic-spacing-stack-sm;
  }

  &__counter {
    margin-bottom: $unnnic-spacing-stack-lg;
  }


}
</style>
