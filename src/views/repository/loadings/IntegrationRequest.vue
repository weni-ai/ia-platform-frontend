<!-- eslint-disable max-len -->
<template>
  <div class="api-loading">
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
