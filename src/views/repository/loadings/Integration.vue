<!-- eslint-disable max-len -->
<template>
  <div class="api-loading">
    <div class="api-loading__header">
      <unnnic-skeleton-loading class="api-loading__title" tag="div" width="40px" height="40px" />
      <unnnic-skeleton-loading tag="div" width="189px" height="40px" />
      <unnnic-skeleton-loading class="api-loading__button" tag="div" width="261px" height="50px" />
    </div>
    <div class="api-loading__description">
      <div>
        <unnnic-skeleton-loading tag="div" width="507px" height="17px" />
      </div>
    </div>
    <div class="api-loading__tabs">
      <unnnic-skeleton-loading tag="div" width="150px" height="20px" />
      <unnnic-skeleton-loading tag="div" width="150px" height="20px" />
    </div>

    <unnnic-skeleton-loading tag="hr" width="100px" height="1px" />

    <div class="api-loading__container">
      <div class="api-loading__container__title">
        <unnnic-skeleton-loading tag="div" width="437px" height="20px" />
      </div>

      <div class="api-loading__container__url">
        <unnnic-skeleton-loading tag="div" width="95px" height="20px" />
        <unnnic-skeleton-loading tag="div" width="1029px" height="20px" />
        <unnnic-skeleton-loading tag="div" width="678px" height="20px" />
        <unnnic-skeleton-loading tag="div" width="1029px" height="60px" />
      </div>

      <div class="api-loading__container__headers">
        <unnnic-skeleton-loading tag="div" width="95px" height="20px" />
        <unnnic-skeleton-loading tag="div" width="1029px" height="20px" />
        <unnnic-skeleton-loading tag="div" width="678px" height="20px" />
        <unnnic-skeleton-loading tag="div" width="95px" height="20px" />
        <unnnic-skeleton-loading tag="div" width="1029px" height="60px" />
        <unnnic-skeleton-loading tag="div" width="1029px" height="60px" />
      </div>

      <div class="api-loading__container__post">
        <unnnic-skeleton-loading tag="div" width="95px" height="20px" />
        <unnnic-skeleton-loading tag="div" width="1029px" height="20px" />
        <unnnic-skeleton-loading tag="div" width="678px" height="20px" />
        <unnnic-skeleton-loading tag="div" width="1029px" height="60px" />
      </div>

      <div class="api-loading__container__response">
        <unnnic-skeleton-loading tag="div" width="95px" height="20px" />
        <unnnic-skeleton-loading tag="div" width="1029px" height="20px" />
        <unnnic-skeleton-loading tag="div" width="678px" height="20px" />
        <unnnic-skeleton-loading tag="div" width="1029px" height="250px" />
        <unnnic-skeleton-loading tag="div" width="1029px" height="60px" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.api-loading {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  padding-bottom: $unnnic-spacing-stack-sm;

  &__header {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-inline-sm;
    height: 80px;
  }

  &__title {
    margin: $unnnic-spacing-inline-xs 0;
  }

  &__button {
    margin-left: auto;
    align-self: end;
  }

  &__description {
    display: flex;
    justify-content: space-between;
  }

  &__tabs {
    display: flex;
    margin-top: $unnnic-spacing-stack-md;
    gap: $unnnic-spacing-inline-sm;
  }

  &__container {
    &__title {
      margin-bottom: $unnnic-spacing-stack-md;
    }

    &__headers {
      margin: $unnnic-spacing-stack-md 0px;
    }

    &__response {
      margin: $unnnic-spacing-stack-md 0px;
    }
  }
}
</style>
